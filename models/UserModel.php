<?php

use Firebase\JWT\JWT;

class UserModel
{
    public $enlace;

    /** Inicializa el acceso del modelo a la base de datos. */
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /** Obtiene todos los usuarios registrados. */
    public function all()
    {
        return $this->allMantenimiento();
    }

    /** Obtiene usuarios con rol para la pantalla administrativa. */
    public function allMantenimiento()
    {
        $vSql = "
            SELECT
                u.id_usuario AS id,
                u.nombre_completo AS name,
                u.email,
                u.telefono,
                u.id_rol AS rol_id,
                r.nombre_rol AS rol,
                u.activo
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
            ORDER BY u.id_usuario ASC;
        ";

        $resultado = $this->enlace->executeSQL($vSql);
        return is_array($resultado) ? $resultado : [];
    }

    /** Obtiene un usuario por ID junto con su rol. */
    public function get($id)
    {
        $id = $this->validarId($id);
        $vSql = "
            SELECT
                u.id_usuario AS id,
                u.nombre_completo AS name,
                u.email,
                u.telefono,
                u.id_rol AS rol_id,
                r.nombre_rol AS rol_nombre,
                u.activo
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.id_usuario = $id
            LIMIT 1;
        ";

        $resultado = $this->enlace->executeSQL($vSql);

        if (empty($resultado) || !is_array($resultado)) {
            return null;
        }

        $usuario = $resultado[0];
        $usuario->rol = (object) [
            'id' => $usuario->rol_id,
            'name' => $usuario->rol_nombre,
        ];
        unset($usuario->rol_nombre);

        return $usuario;
    }

    /** Devuelve el usuario autenticado para la pantalla de perfil. */
    public function getPerfil($idUsuarioAutenticado)
    {
        return $this->get($idUsuarioAutenticado);
    }

    /** Obtiene todos los usuarios que tienen el rol de cliente. */
    public function allCustomer()
    {
        $idCliente = $this->getRolClienteId();
        $vSql = "
            SELECT
                id_usuario AS id,
                nombre_completo AS name,
                email,
                id_rol AS rol_id,
                telefono,
                activo
            FROM usuarios
            WHERE id_rol = $idCliente AND activo = 1
            ORDER BY nombre_completo ASC;
        ";

        $resultado = $this->enlace->executeSQL($vSql);
        return is_array($resultado) ? $resultado : [];
    }

    /** Valida las credenciales y genera el token JWT del usuario. */
    public function login($objeto)
    {
        if (!is_object($objeto)) {
            return false;
        }

        $email = trim((string) ($objeto->email ?? ""));
        $password = (string) ($objeto->password ?? "");

        if ($email === "" || $password === "") {
            return false;
        }

        $emailSeguro = $this->escapar($email);
        $vSql = "
            SELECT
                id_usuario AS id,
                email,
                password_hash AS password,
                activo
            FROM usuarios
            WHERE email = '$emailSeguro'
            LIMIT 1;
        ";

        $resultado = $this->enlace->executeSQL($vSql);

        if (empty($resultado) || !is_array($resultado) || !is_object($resultado[0])) {
            return false;
        }

        $user = $resultado[0];

        if ((int) $user->activo !== 1 || !password_verify($password, $user->password)) {
            return false;
        }

        $usuario = $this->get($user->id);

        if (empty($usuario)) {
            return false;
        }

        $data = [
            'id' => $usuario->id,
            'email' => $usuario->email,
            'rol' => $usuario->rol,
            'iat' => time(),
            'exp' => time() + 3600,
        ];

        return JWT::encode($data, Config::get('SECRET_KEY'), 'HS256');
    }

    /** Registra un usuario publico con rol Cliente forzado. */
    public function register($objeto)
    {
        $data = $this->validarUsuario($objeto, true, false);
        $data['id_rol'] = $this->getRolClienteId();
        $data['activo'] = 1;

        return $this->insertarUsuario($data);
    }

    /** Crea un usuario desde mantenimiento, permitiendo seleccionar rol. */
    public function create($objeto)
    {
        $data = $this->validarUsuario($objeto, true, true);
        return $this->insertarUsuario($data);
    }

    /** Actualiza un usuario desde mantenimiento. */
    public function update($id, $objeto)
    {
        $id = $this->validarId($id);
        $data = $this->validarUsuario($objeto, false, true, $id);

        $this->enlace->executeTransaction(function ($db) use ($id, $data) {
            $this->comprobarUsuario($db, $id);
            $this->comprobarRol($db, $data['id_rol']);
            $this->evitarSinAdministradores($db, $id, $data['id_rol'], $data['activo']);

            $stmt = $db->prepare(
                "UPDATE usuarios
                 SET nombre_completo = ?, email = ?, telefono = ?, id_rol = ?, activo = ?
                 WHERE id_usuario = ?"
            );

            if (!$stmt) {
                throw new RuntimeException($db->error);
            }

            $stmt->bind_param(
                "sssiii",
                $data['name'],
                $data['email'],
                $data['telefono'],
                $data['id_rol'],
                $data['activo'],
                $id
            );

            if (!$stmt->execute()) {
                if ($stmt->errno === 1062) {
                    throw new InvalidArgumentException("Ya existe un usuario con ese correo");
                }
                throw new RuntimeException($stmt->error);
            }

            $stmt->close();
        });

        return $this->get($id);
    }

    /** Actualiza los datos propios del perfil, sin modificar rol ni estado. */
    public function updatePerfil($idUsuarioAutenticado, $objeto)
    {
        $id = $this->validarId($idUsuarioAutenticado);

        if (!is_object($objeto)) {
            throw new InvalidArgumentException("Los datos del perfil no son validos");
        }

        $name = trim((string) ($objeto->name ?? ""));
        $email = trim((string) ($objeto->email ?? ""));
        $telefono = trim((string) ($objeto->telefono ?? ""));

        if ($name === "") {
            throw new InvalidArgumentException("El nombre es requerido");
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("El correo no es valido");
        }
        if ($telefono !== "" && !preg_match('/^[0-9+\-\s]{7,20}$/', $telefono)) {
            throw new InvalidArgumentException("El telefono no es valido");
        }

        $this->enlace->executeTransaction(function ($db) use ($id, $name, $email, $telefono) {
            $this->comprobarUsuario($db, $id);
            $this->comprobarEmailDisponible($db, $email, $id);

            $stmt = $db->prepare(
                "UPDATE usuarios
                 SET nombre_completo = ?, email = ?, telefono = ?
                 WHERE id_usuario = ?"
            );

            if (!$stmt) {
                throw new RuntimeException($db->error);
            }

            $stmt->bind_param("sssi", $name, $email, $telefono, $id);

            if (!$stmt->execute()) {
                if ($stmt->errno === 1062) {
                    throw new InvalidArgumentException("Ya existe un usuario con ese correo");
                }
                throw new RuntimeException($stmt->error);
            }

            $stmt->close();
        });

        return $this->getPerfil($id);
    }

    /** Desactiva un usuario sin borrarlo fisicamente. */
    public function delete($id)
    {
        return $this->cambiarEstado($id, 0, "Usuario desactivado correctamente");
    }

    /** Reactiva un usuario. */
    public function activar($id)
    {
        return $this->cambiarEstado($id, 1, "Usuario activado correctamente");
    }

    /** Devuelve roles disponibles. */
    public function getRoles()
    {
        return (new RolModel())->all();
    }

    /** Indica si existe un correo, excluyendo opcionalmente un usuario. */
    public function emailExists($correo, $idExcluir = null)
    {
        $correoSeguro = $this->escapar($correo);
        $sql = "SELECT id_usuario FROM usuarios WHERE email = '$correoSeguro'";

        if ($idExcluir !== null) {
            $idExcluir = $this->validarId($idExcluir);
            $sql .= " AND id_usuario <> $idExcluir";
        }

        $sql .= " LIMIT 1;";
        $resultado = $this->enlace->executeSQL($sql);

        return !empty($resultado) && is_array($resultado);
    }

    /** Obtiene el id del rol Cliente. */
    public function getRolClienteId()
    {
        $resultado = $this->enlace->executeSQL(
            "SELECT id_rol FROM roles WHERE nombre_rol = 'Cliente' LIMIT 1;"
        );

        if (empty($resultado) || !is_array($resultado)) {
            throw new RuntimeException("No existe el rol Cliente");
        }

        return (int) $resultado[0]->id_rol;
    }

    /** Inserta un usuario validado. */
    private function insertarUsuario(array $data)
    {
        $idCreado = $this->enlace->executeTransaction(function ($db) use ($data) {
            $this->comprobarRol($db, $data['id_rol']);
            $this->comprobarEmailDisponible($db, $data['email']);

            $stmt = $db->prepare(
                "INSERT INTO usuarios
                    (nombre_completo, email, password_hash, telefono, id_rol, activo)
                 VALUES (?, ?, ?, ?, ?, ?)"
            );

            if (!$stmt) {
                throw new RuntimeException($db->error);
            }

            $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);
            $stmt->bind_param(
                "ssssii",
                $data['name'],
                $data['email'],
                $passwordHash,
                $data['telefono'],
                $data['id_rol'],
                $data['activo']
            );

            if (!$stmt->execute()) {
                if ($stmt->errno === 1062) {
                    throw new InvalidArgumentException("Ya existe un usuario con ese correo");
                }
                throw new RuntimeException($stmt->error);
            }

            $idCreado = $db->insert_id;
            $stmt->close();

            return $idCreado;
        });

        return $this->get($idCreado);
    }

    /** Valida datos de usuario desde registro o mantenimiento. */
    private function validarUsuario($objeto, $requierePassword, $permiteRol, $idExcluir = null)
    {
        if (!is_object($objeto)) {
            throw new InvalidArgumentException("Los datos del usuario no son validos");
        }

        $name = trim((string) ($objeto->name ?? $objeto->nombre ?? ""));
        $email = trim((string) ($objeto->email ?? ""));
        $telefono = trim((string) ($objeto->telefono ?? ""));
        $password = (string) ($objeto->password ?? "");
        $confirmPassword = (string) ($objeto->confirmPassword ?? $objeto->confirmar_password ?? "");
        $rolId = $permiteRol
            ? filter_var($objeto->rol_id ?? $objeto->id_rol ?? null, FILTER_VALIDATE_INT)
            : $this->getRolClienteId();
        $activo = isset($objeto->activo) && (int) $objeto->activo === 0 ? 0 : 1;

        if ($name === "") {
            throw new InvalidArgumentException("El nombre es requerido");
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("El correo no es valido");
        }
        if ($this->emailExists($email, $idExcluir)) {
            throw new InvalidArgumentException("Ya existe un usuario con ese correo");
        }
        if ($telefono !== "" && !preg_match('/^[0-9+\-\s]{7,20}$/', $telefono)) {
            throw new InvalidArgumentException("El telefono no es valido");
        }
        if ($permiteRol && ($rolId === false || $rolId <= 0)) {
            throw new InvalidArgumentException("Seleccione un rol valido");
        }
        if ($requierePassword) {
            if (strlen($password) < 6) {
                throw new InvalidArgumentException("La contrasena debe tener al menos 6 caracteres");
            }
            if ($confirmPassword !== "" && $password !== $confirmPassword) {
                throw new InvalidArgumentException("La confirmacion de contrasena no coincide");
            }
        }

        return [
            'name' => $name,
            'email' => $email,
            'telefono' => $telefono,
            'password' => $password,
            'id_rol' => (int) $rolId,
            'activo' => $activo,
        ];
    }

    /** Comprueba que el usuario exista y bloquea su fila. */
    private function comprobarUsuario($db, $id)
    {
        $stmt = $db->prepare("SELECT id_usuario FROM usuarios WHERE id_usuario = ? FOR UPDATE");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows === 0) {
            $stmt->close();
            throw new InvalidArgumentException("El usuario solicitado no existe");
        }

        $stmt->close();
    }

    /** Comprueba que un rol exista. */
    private function comprobarRol($db, $idRol)
    {
        $stmt = $db->prepare("SELECT id_rol FROM roles WHERE id_rol = ?");
        $stmt->bind_param("i", $idRol);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows === 0) {
            $stmt->close();
            throw new InvalidArgumentException("El rol seleccionado no existe");
        }

        $stmt->close();
    }

    /** Comprueba disponibilidad de correo dentro de una transaccion. */
    private function comprobarEmailDisponible($db, $email, $idExcluir = null)
    {
        if ($idExcluir === null) {
            $stmt = $db->prepare("SELECT id_usuario FROM usuarios WHERE email = ?");
            $stmt->bind_param("s", $email);
        } else {
            $stmt = $db->prepare(
                "SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario <> ?"
            );
            $stmt->bind_param("si", $email, $idExcluir);
        }

        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows > 0) {
            $stmt->close();
            throw new InvalidArgumentException("Ya existe un usuario con ese correo");
        }

        $stmt->close();
    }

    /** Evita dejar el sistema sin administradores activos. */
    private function evitarSinAdministradores($db, $id, $idRolDestino, $activoDestino)
    {
        $stmtRol = $db->prepare("SELECT id_rol FROM roles WHERE nombre_rol = 'Administrador' LIMIT 1");
        $stmtRol->execute();
        $resultadoRol = $stmtRol->get_result();

        if ($resultadoRol->num_rows === 0) {
            $stmtRol->close();
            return;
        }

        $idRolAdmin = (int) $resultadoRol->fetch_assoc()['id_rol'];
        $stmtRol->close();

        $stmtUsuario = $db->prepare("SELECT id_rol, activo FROM usuarios WHERE id_usuario = ?");
        $stmtUsuario->bind_param("i", $id);
        $stmtUsuario->execute();
        $usuario = $stmtUsuario->get_result()->fetch_assoc();
        $stmtUsuario->close();

        if ((int) $usuario['id_rol'] !== $idRolAdmin || (int) $usuario['activo'] !== 1) {
            return;
        }
        if ((int) $idRolDestino === $idRolAdmin && (int) $activoDestino === 1) {
            return;
        }

        $stmtTotal = $db->prepare(
            "SELECT COUNT(*) AS total
             FROM usuarios
             WHERE id_rol = ? AND activo = 1 AND id_usuario <> ?"
        );
        $stmtTotal->bind_param("ii", $idRolAdmin, $id);
        $stmtTotal->execute();
        $total = (int) $stmtTotal->get_result()->fetch_assoc()['total'];
        $stmtTotal->close();

        if ($total === 0) {
            throw new InvalidArgumentException(
                "No se puede dejar el sistema sin administradores activos"
            );
        }
    }

    /** Cambia el estado activo del usuario. */
    private function cambiarEstado($id, $activo, $mensaje)
    {
        $id = $this->validarId($id);

        $this->enlace->executeTransaction(function ($db) use ($id, $activo) {
            $this->comprobarUsuario($db, $id);

            $stmtUsuario = $db->prepare("SELECT id_rol FROM usuarios WHERE id_usuario = ?");
            $stmtUsuario->bind_param("i", $id);
            $stmtUsuario->execute();
            $usuario = $stmtUsuario->get_result()->fetch_assoc();
            $stmtUsuario->close();

            $this->evitarSinAdministradores($db, $id, (int) $usuario['id_rol'], $activo);

            $stmt = $db->prepare("UPDATE usuarios SET activo = ? WHERE id_usuario = ?");
            $stmt->bind_param("ii", $activo, $id);

            if (!$stmt->execute()) {
                throw new RuntimeException($stmt->error);
            }

            $stmt->close();
        });

        return [
            'message' => $mensaje,
            'id' => $id,
            'activo' => $activo,
        ];
    }

    /** Escapa valores simples antes de interpolarlos en consultas existentes. */
    private function escapar($valor)
    {
        return str_replace(["\\", "'"], ["\\\\", "\\'"], $valor);
    }

    /** Convierte y valida un identificador. */
    private function validarId($id)
    {
        $idValidado = filter_var($id, FILTER_VALIDATE_INT);

        if ($idValidado === false || $idValidado <= 0) {
            throw new InvalidArgumentException("El identificador de usuario no es valido");
        }

        return $idValidado;
    }
}
