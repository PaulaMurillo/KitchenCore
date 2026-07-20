<?php

class ComboModel
{
    public $enlace;

    /** Inicializa el acceso del modelo a la base de datos. */
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /** Obtiene todos los combos activos y su cantidad de productos. */
    public function all()
    {
        $vSQL = "
            SELECT
                cb.id_combo AS id,
                cb.nombre,
                cb.descripcion,
                cb.precio_especial,
                cb.imagen_url,
                cb.activo,
                COUNT(cp.id_producto) AS cantidad_productos
            FROM Combos cb
            LEFT JOIN Combo_Productos cp ON cb.id_combo = cp.id_combo
            WHERE cb.activo = 1
            GROUP BY
                cb.id_combo,
                cb.nombre,
                cb.descripcion,
                cb.precio_especial,
                cb.imagen_url,
                cb.activo
            ORDER BY cb.nombre ASC;
        ";

        return $this->enlace->executeSQL($vSQL);
    }

    /** Obtiene todos los combos para administracion. */
    public function allMantenimiento()
    {
        $vSQL = "
            SELECT
                cb.id_combo AS id,
                cb.nombre,
                cb.descripcion,
                cb.precio_especial,
                cb.imagen_url,
                cb.activo,
                COUNT(cp.id_producto) AS cantidad_productos
            FROM Combos cb
            LEFT JOIN Combo_Productos cp ON cb.id_combo = cp.id_combo
            GROUP BY
                cb.id_combo,
                cb.nombre,
                cb.descripcion,
                cb.precio_especial,
                cb.imagen_url,
                cb.activo
            ORDER BY cb.id_combo ASC;
        ";

        return $this->enlace->executeSQL($vSQL);
    }

    /** Obtiene el detalle de un combo y los productos que incluye. */
    public function get($id)
    {
        $id = $this->validarId($id);

        $vSQL = "
            SELECT
                cb.id_combo AS id,
                cb.nombre,
                cb.descripcion,
                cb.precio_especial,
                cb.imagen_url,
                cb.id_categoria,
                cb.activo
            FROM Combos cb
            WHERE cb.id_combo = $id
            LIMIT 1;
        ";

        $vResultado = $this->enlace->executeSQL($vSQL);

        if (empty($vResultado) || !is_array($vResultado)) {
            return null;
        }

        $combo = $vResultado[0];
        $sqlProductos = "
            SELECT
                p.id_producto AS id,
                p.nombre,
                p.descripcion,
                p.precio,
                cp.cantidad
            FROM Combo_Productos cp
            INNER JOIN Productos p ON cp.id_producto = p.id_producto
            WHERE cp.id_combo = $id
            ORDER BY p.nombre ASC;
        ";

        $productos = $this->enlace->executeSQL($sqlProductos);
        $combo->productos = is_array($productos) ? $productos : [];

        return $combo;
    }

    /** Crea un combo y sus productos en una transaccion. */
    public function create($data)
    {
        $combo = $this->validarCombo($data);

        $id = $this->enlace->executeTransaction(function ($db) use ($combo) {
            $this->comprobarNombreDisponible($db, $combo['nombre']);
            $this->comprobarProductosDisponibles($db, $combo['productos']);

            $stmt = $db->prepare(
                "INSERT INTO Combos
                    (nombre, descripcion, precio_especial, imagen_url, id_categoria, activo)
                 VALUES (?, ?, ?, ?, ?, ?)"
            );

            if (!$stmt) {
                throw new RuntimeException($db->error);
            }

            $stmt->bind_param(
                "ssdsii",
                $combo['nombre'],
                $combo['descripcion'],
                $combo['precio_especial'],
                $combo['imagen_url'],
                $combo['id_categoria'],
                $combo['activo']
            );

            if (!$stmt->execute()) {
                if ($stmt->errno === 1062) {
                    throw new InvalidArgumentException("Ya existe un combo con ese nombre");
                }
                throw new RuntimeException($stmt->error);
            }

            $idCombo = $db->insert_id;
            $stmt->close();
            $this->insertarProductos($db, $idCombo, $combo['productos']);

            return $idCombo;
        });

        return $this->get($id);
    }

    /** Actualiza el combo y reemplaza sus productos. */
    public function update($id, $data)
    {
        $id = $this->validarId($id);
        $combo = $this->validarCombo($data);

        $this->enlace->executeTransaction(function ($db) use ($id, $combo) {
            $this->comprobarCombo($db, $id);
            $this->comprobarNombreDisponible($db, $combo['nombre'], $id);
            $this->comprobarProductosDisponibles($db, $combo['productos']);

            $stmt = $db->prepare(
                "UPDATE Combos
                 SET nombre = ?, descripcion = ?, precio_especial = ?,
                     imagen_url = ?, id_categoria = ?, activo = ?
                 WHERE id_combo = ?"
            );

            if (!$stmt) {
                throw new RuntimeException($db->error);
            }

            $stmt->bind_param(
                "ssdsiii",
                $combo['nombre'],
                $combo['descripcion'],
                $combo['precio_especial'],
                $combo['imagen_url'],
                $combo['id_categoria'],
                $combo['activo'],
                $id
            );

            if (!$stmt->execute()) {
                if ($stmt->errno === 1062) {
                    throw new InvalidArgumentException("Ya existe un combo con ese nombre");
                }
                throw new RuntimeException($stmt->error);
            }
            $stmt->close();

            $stmt = $db->prepare("DELETE FROM Combo_Productos WHERE id_combo = ?");
            $stmt->bind_param("i", $id);
            if (!$stmt->execute()) {
                throw new RuntimeException($stmt->error);
            }
            $stmt->close();

            $this->insertarProductos($db, $id, $combo['productos']);
        });

        return $this->get($id);
    }

    /** Desactiva un combo sin borrar relaciones. */
    public function delete($id)
    {
        return $this->cambiarEstado($id, 0, "Combo desactivado correctamente");
    }

    /** Reactiva un combo. */
    public function activar($id)
    {
        return $this->cambiarEstado($id, 1, "Combo activado correctamente");
    }

    /** Devuelve productos activos para formularios de combos. */
    public function getProductos()
    {
        return $this->enlace->executeSQL(
            "SELECT id_producto AS id, nombre, precio
             FROM Productos
             WHERE activo = 1
             ORDER BY nombre ASC;"
        );
    }

    /** Valida y normaliza los datos recibidos. */
    private function validarCombo($data)
    {
        if (!is_object($data)) {
            throw new InvalidArgumentException("Los datos del combo no son validos");
        }

        $nombre = trim((string) ($data->nombre ?? ""));
        $descripcion = trim((string) ($data->descripcion ?? ""));
        $precio = filter_var($data->precio_especial ?? null, FILTER_VALIDATE_FLOAT);
        $imagenUrl = trim((string) ($data->imagen_url ?? ""));
        $activo = isset($data->activo) && (int) $data->activo === 0 ? 0 : 1;
        $productosEntrada = $data->productos ?? null;

        if ($nombre === "") {
            throw new InvalidArgumentException("El nombre es requerido");
        }
        if (strlen($nombre) < 3) {
            throw new InvalidArgumentException("El nombre debe tener al menos 3 caracteres");
        }
        if ($descripcion === "") {
            throw new InvalidArgumentException("La descripcion es requerida");
        }
        if ($precio === false || $precio <= 0) {
            throw new InvalidArgumentException("El precio especial debe ser mayor que cero");
        }
        if (
            $imagenUrl !== "" &&
            (
                str_contains($imagenUrl, "\\") ||
                str_contains($imagenUrl, "..") ||
                preg_match('/^[a-zA-Z]:/', $imagenUrl)
            )
        ) {
            throw new InvalidArgumentException("La ruta de imagen no es valida");
        }
        if (!is_array($productosEntrada) || count($productosEntrada) === 0) {
            throw new InvalidArgumentException("Debe seleccionar al menos un producto");
        }

        $productos = [];
        $idsUtilizados = [];

        foreach ($productosEntrada as $producto) {
            if (!is_object($producto)) {
                throw new InvalidArgumentException("La informacion de productos no es valida");
            }

            $idProducto = filter_var($producto->id_producto ?? null, FILTER_VALIDATE_INT);
            $cantidad = filter_var($producto->cantidad ?? null, FILTER_VALIDATE_INT);

            if ($idProducto === false || $idProducto <= 0) {
                throw new InvalidArgumentException("Seleccione un producto valido");
            }
            if ($cantidad === false || $cantidad <= 0) {
                throw new InvalidArgumentException("Las cantidades deben ser mayores que cero");
            }
            if (isset($idsUtilizados[$idProducto])) {
                throw new InvalidArgumentException("No se pueden repetir productos en el combo");
            }

            $idsUtilizados[$idProducto] = true;
            $productos[] = [
                'id_producto' => $idProducto,
                'cantidad' => $cantidad,
            ];
        }

        return [
            'nombre' => $nombre,
            'descripcion' => $descripcion,
            'precio_especial' => (float) $precio,
            'imagen_url' => $imagenUrl === "" ? null : $imagenUrl,
            'id_categoria' => 4,
            'activo' => $activo,
            'productos' => $productos,
        ];
    }

    /** Inserta los productos del combo. */
    private function insertarProductos($db, $idCombo, array $productos)
    {
        $stmt = $db->prepare(
            "INSERT INTO Combo_Productos (id_combo, id_producto, cantidad)
             VALUES (?, ?, ?)"
        );

        if (!$stmt) {
            throw new RuntimeException($db->error);
        }

        foreach ($productos as $producto) {
            $idProducto = $producto['id_producto'];
            $cantidad = $producto['cantidad'];
            $stmt->bind_param("iii", $idCombo, $idProducto, $cantidad);

            if (!$stmt->execute()) {
                throw new RuntimeException($stmt->error);
            }
        }

        $stmt->close();
    }

    /** Comprueba que el combo exista. */
    private function comprobarCombo($db, $id)
    {
        $stmt = $db->prepare("SELECT id_combo FROM Combos WHERE id_combo = ? FOR UPDATE");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows === 0) {
            $stmt->close();
            throw new InvalidArgumentException("El combo solicitado no existe");
        }

        $stmt->close();
    }

    /** Evita infringir el nombre unico. */
    private function comprobarNombreDisponible($db, $nombre, $idExcluir = null)
    {
        if ($idExcluir === null) {
            $stmt = $db->prepare("SELECT id_combo FROM Combos WHERE nombre = ?");
            $stmt->bind_param("s", $nombre);
        } else {
            $stmt = $db->prepare(
                "SELECT id_combo FROM Combos WHERE nombre = ? AND id_combo <> ?"
            );
            $stmt->bind_param("si", $nombre, $idExcluir);
        }

        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows > 0) {
            $stmt->close();
            throw new InvalidArgumentException("Ya existe un combo con ese nombre");
        }

        $stmt->close();
    }

    /** Comprueba que todos los productos existan y esten activos. */
    private function comprobarProductosDisponibles($db, array $productos)
    {
        $stmt = $db->prepare(
            "SELECT id_producto FROM Productos WHERE id_producto = ? AND activo = 1"
        );

        foreach ($productos as $producto) {
            $idProducto = $producto['id_producto'];
            $stmt->bind_param("i", $idProducto);
            $stmt->execute();
            $resultado = $stmt->get_result();

            if ($resultado->num_rows === 0) {
                $stmt->close();
                throw new InvalidArgumentException(
                    "Uno de los productos seleccionados no esta disponible"
                );
            }
        }

        $stmt->close();
    }

    /** Cambia el indicador activo. */
    private function cambiarEstado($id, $activo, $mensaje)
    {
        $id = $this->validarId($id);

        $this->enlace->executeTransaction(function ($db) use ($id, $activo) {
            $this->comprobarCombo($db, $id);
            $stmt = $db->prepare("UPDATE Combos SET activo = ? WHERE id_combo = ?");
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

    /** Convierte y valida un identificador. */
    private function validarId($id)
    {
        $idValidado = filter_var($id, FILTER_VALIDATE_INT);

        if ($idValidado === false || $idValidado <= 0) {
            throw new InvalidArgumentException("El identificador del combo no es valido");
        }

        return $idValidado;
    }
}
