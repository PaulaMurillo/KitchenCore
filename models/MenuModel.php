<?php

class MenuModel
{
    public $enlace;

    /** Inicializa el acceso del modelo a la base de datos. */
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /** Obtiene los menus ordenados segun su estado de disponibilidad. */
    public function all()
    {
        return $this->allMantenimiento();
    }

    /** Obtiene todos los menus con conteos para administracion. */
    public function allMantenimiento()
    {
        $vSQL = "
            SELECT
                m.id_menu AS id,
                m.nombre,
                m.fecha_inicio,
                m.fecha_fin,
                m.hora_inicio,
                m.hora_fin,
                m.activo,
                COUNT(DISTINCT mi_producto.id_menu_item) AS cantidad_productos,
                COUNT(DISTINCT mi_combo.id_menu_item) AS cantidad_combos,
                CASE
                    WHEN m.activo = 1
                    AND CURDATE() BETWEEN m.fecha_inicio AND m.fecha_fin
                    AND CURTIME() BETWEEN m.hora_inicio AND m.hora_fin
                    THEN 'Disponible'
                    WHEN m.fecha_inicio > CURDATE()
                    THEN 'Proximo'
                    ELSE 'No disponible'
                END AS estado
            FROM Menus m
            LEFT JOIN Menu_Items mi_producto
                ON m.id_menu = mi_producto.id_menu AND mi_producto.id_producto IS NOT NULL
            LEFT JOIN Menu_Items mi_combo
                ON m.id_menu = mi_combo.id_menu AND mi_combo.id_combo IS NOT NULL
            GROUP BY
                m.id_menu,
                m.nombre,
                m.fecha_inicio,
                m.fecha_fin,
                m.hora_inicio,
                m.hora_fin,
                m.activo
            ORDER BY
                CASE
                    WHEN m.activo = 1
                        AND CURDATE() BETWEEN m.fecha_inicio AND m.fecha_fin
                        AND CURTIME() BETWEEN m.hora_inicio AND m.hora_fin
                        THEN 1
                    WHEN m.fecha_inicio > CURDATE()
                        THEN 3
                    ELSE 2
                END,
                m.fecha_inicio DESC,
                m.id_menu DESC;
        ";

        return $this->enlace->executeSQL($vSQL);
    }

    /** Obtiene el menu disponible actualmente y agrupa sus elementos por categoria. */
    public function disponible()
    {
        $sqlMenu = "
            SELECT
                m.id_menu AS id,
                m.nombre,
                m.fecha_inicio,
                m.fecha_fin,
                m.hora_inicio,
                m.hora_fin
            FROM Menus m
            WHERE m.activo = 1
            AND CURDATE() BETWEEN m.fecha_inicio AND m.fecha_fin
            AND CURTIME() BETWEEN m.hora_inicio AND m.hora_fin
            ORDER BY m.fecha_inicio DESC, m.id_menu DESC
            LIMIT 1;
        ";

        $resultadoMenu = $this->enlace->executeSQL($sqlMenu);

        if (empty($resultadoMenu) || !is_array($resultadoMenu)) {
            return null;
        }

        $menu = $resultadoMenu[0];
        $idMenu = intval($menu->id);
        $items = $this->obtenerItemsAgrupables($idMenu);
        $menu->categorias = $this->agruparPorCategoria($items);

        return $menu;
    }

    /** Obtiene un menu con productos y combos incluidos. */
    public function get($id)
    {
        if ($id === "disponible") {
            return $this->disponible();
        }

        $id = $this->validarId($id);

        $vSQL = "
            SELECT
                m.id_menu AS id,
                m.nombre,
                m.fecha_inicio,
                m.fecha_fin,
                m.hora_inicio,
                m.hora_fin,
                m.activo
            FROM Menus m
            WHERE m.id_menu = $id
            LIMIT 1;
        ";

        $resultado = $this->enlace->executeSQL($vSQL);

        if (empty($resultado) || !is_array($resultado)) {
            return null;
        }

        $menu = $resultado[0];
        $productos = $this->enlace->executeSQL(
            "SELECT p.id_producto AS id, p.nombre, p.descripcion, p.precio, c.nombre AS categoria
             FROM Menu_Items mi
             INNER JOIN Productos p ON mi.id_producto = p.id_producto
             INNER JOIN Categorias c ON p.id_categoria = c.id_categoria
             WHERE mi.id_menu = $id
             ORDER BY c.nombre ASC, p.nombre ASC;"
        );
        $combos = $this->enlace->executeSQL(
            "SELECT cb.id_combo AS id, cb.nombre, cb.descripcion, cb.precio_especial, c.nombre AS categoria
             FROM Menu_Items mi
             INNER JOIN Combos cb ON mi.id_combo = cb.id_combo
             INNER JOIN Categorias c ON cb.id_categoria = c.id_categoria
             WHERE mi.id_menu = $id
             ORDER BY c.nombre ASC, cb.nombre ASC;"
        );

        $menu->productos = is_array($productos) ? $productos : [];
        $menu->combos = is_array($combos) ? $combos : [];

        return $menu;
    }

    /** Crea un menu con sus items. */
    public function create($data)
    {
        $menu = $this->validarMenu($data);

        $id = $this->enlace->executeTransaction(function ($db) use ($menu) {
            $this->comprobarProductosDisponibles($db, $menu['productos']);
            $this->comprobarCombosDisponibles($db, $menu['combos']);

            $stmt = $db->prepare(
                "INSERT INTO Menus
                    (nombre, fecha_inicio, fecha_fin, hora_inicio, hora_fin, activo)
                 VALUES (?, ?, ?, ?, ?, ?)"
            );

            if (!$stmt) {
                throw new RuntimeException($db->error);
            }

            $stmt->bind_param(
                "sssssi",
                $menu['nombre'],
                $menu['fecha_inicio'],
                $menu['fecha_fin'],
                $menu['hora_inicio'],
                $menu['hora_fin'],
                $menu['activo']
            );

            if (!$stmt->execute()) {
                throw new RuntimeException($stmt->error);
            }

            $idMenu = $db->insert_id;
            $stmt->close();
            $this->insertarItems($db, $idMenu, $menu['productos'], $menu['combos']);

            return $idMenu;
        });

        return $this->get($id);
    }

    /** Actualiza un menu y reemplaza sus items. */
    public function update($id, $data)
    {
        $id = $this->validarId($id);
        $menu = $this->validarMenu($data);

        $this->enlace->executeTransaction(function ($db) use ($id, $menu) {
            $this->comprobarMenu($db, $id);
            $this->comprobarProductosDisponibles($db, $menu['productos']);
            $this->comprobarCombosDisponibles($db, $menu['combos']);

            $stmt = $db->prepare(
                "UPDATE Menus
                 SET nombre = ?, fecha_inicio = ?, fecha_fin = ?,
                     hora_inicio = ?, hora_fin = ?, activo = ?
                 WHERE id_menu = ?"
            );

            if (!$stmt) {
                throw new RuntimeException($db->error);
            }

            $stmt->bind_param(
                "sssssii",
                $menu['nombre'],
                $menu['fecha_inicio'],
                $menu['fecha_fin'],
                $menu['hora_inicio'],
                $menu['hora_fin'],
                $menu['activo'],
                $id
            );

            if (!$stmt->execute()) {
                throw new RuntimeException($stmt->error);
            }
            $stmt->close();

            $stmt = $db->prepare("DELETE FROM Menu_Items WHERE id_menu = ?");
            $stmt->bind_param("i", $id);
            if (!$stmt->execute()) {
                throw new RuntimeException($stmt->error);
            }
            $stmt->close();

            $this->insertarItems($db, $id, $menu['productos'], $menu['combos']);
        });

        return $this->get($id);
    }

    /** Desactiva un menu. */
    public function delete($id)
    {
        return $this->cambiarEstado($id, 0, "Menu desactivado correctamente");
    }

    /** Reactiva un menu. */
    public function activar($id)
    {
        return $this->cambiarEstado($id, 1, "Menu activado correctamente");
    }

    /** Devuelve productos activos para formularios. */
    public function getProductos()
    {
        return $this->enlace->executeSQL(
            "SELECT p.id_producto AS id, p.nombre, p.precio, c.nombre AS categoria
             FROM Productos p
             INNER JOIN Categorias c ON p.id_categoria = c.id_categoria
             WHERE p.activo = 1
             ORDER BY c.nombre ASC, p.nombre ASC;"
        );
    }

    /** Devuelve combos activos para formularios. */
    public function getCombos()
    {
        return $this->enlace->executeSQL(
            "SELECT cb.id_combo AS id, cb.nombre, cb.precio_especial, c.nombre AS categoria
             FROM Combos cb
             INNER JOIN Categorias c ON cb.id_categoria = c.id_categoria
             WHERE cb.activo = 1
             ORDER BY cb.nombre ASC;"
        );
    }

    /** Valida y normaliza el cuerpo recibido. */
    private function validarMenu($data)
    {
        if (!is_object($data)) {
            throw new InvalidArgumentException("Los datos del menu no son validos");
        }

        $nombre = trim((string) ($data->nombre ?? ""));
        $fechaInicio = trim((string) ($data->fecha_inicio ?? ""));
        $fechaFin = trim((string) ($data->fecha_fin ?? ""));
        $horaInicio = $this->normalizarHora($data->hora_inicio ?? "");
        $horaFin = $this->normalizarHora($data->hora_fin ?? "");
        $activo = isset($data->activo) && (int) $data->activo === 0 ? 0 : 1;
        $productos = $this->validarIdsUnicos($data->productos ?? [], "productos");
        $combos = $this->validarIdsUnicos($data->combos ?? [], "combos");

        if ($nombre === "") {
            throw new InvalidArgumentException("El nombre es requerido");
        }
        if (!$this->fechaValida($fechaInicio)) {
            throw new InvalidArgumentException("La fecha de inicio no es valida");
        }
        if (!$this->fechaValida($fechaFin)) {
            throw new InvalidArgumentException("La fecha de fin no es valida");
        }
        if ($fechaInicio > $fechaFin) {
            throw new InvalidArgumentException(
                "La fecha de inicio no puede ser mayor que la fecha final"
            );
        }
        if (!$this->horaValida($horaInicio)) {
            throw new InvalidArgumentException("La hora de inicio no es valida");
        }
        if (!$this->horaValida($horaFin)) {
            throw new InvalidArgumentException("La hora de fin no es valida");
        }
        if ($fechaInicio === $fechaFin && $horaInicio >= $horaFin) {
            throw new InvalidArgumentException(
                "La hora de inicio debe ser menor que la hora final"
            );
        }
        if (count($productos) === 0 && count($combos) === 0) {
            throw new InvalidArgumentException(
                "Debe seleccionar al menos un producto o un combo"
            );
        }

        return [
            'nombre' => $nombre,
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
            'hora_inicio' => $horaInicio,
            'hora_fin' => $horaFin,
            'activo' => $activo,
            'productos' => $productos,
            'combos' => $combos,
        ];
    }

    /** Inserta productos y combos del menu. */
    private function insertarItems($db, $idMenu, array $productos, array $combos)
    {
        $stmtProducto = $db->prepare(
            "INSERT INTO Menu_Items (id_menu, id_producto, id_combo) VALUES (?, ?, NULL)"
        );
        $stmtCombo = $db->prepare(
            "INSERT INTO Menu_Items (id_menu, id_producto, id_combo) VALUES (?, NULL, ?)"
        );

        if (!$stmtProducto || !$stmtCombo) {
            throw new RuntimeException($db->error);
        }

        foreach ($productos as $idProducto) {
            $stmtProducto->bind_param("ii", $idMenu, $idProducto);
            if (!$stmtProducto->execute()) {
                throw new RuntimeException($stmtProducto->error);
            }
        }

        foreach ($combos as $idCombo) {
            $stmtCombo->bind_param("ii", $idMenu, $idCombo);
            if (!$stmtCombo->execute()) {
                throw new RuntimeException($stmtCombo->error);
            }
        }

        $stmtProducto->close();
        $stmtCombo->close();
    }

    /** Obtiene items con una forma comun para el menu disponible. */
    private function obtenerItemsAgrupables($idMenu)
    {
        $items = $this->enlace->executeSQL(
            "SELECT
                mi.id_menu_item AS id,
                CASE WHEN mi.id_producto IS NOT NULL THEN 'Producto' ELSE 'Combo' END AS tipo,
                COALESCE(p.nombre, cb.nombre) AS nombre,
                COALESCE(p.descripcion, cb.descripcion) AS descripcion,
                COALESCE(p.precio, cb.precio_especial) AS precio,
                COALESCE(p.imagen_url, cb.imagen_url) AS imagen_url,
                COALESCE(catp.nombre, catc.nombre) AS categoria
             FROM Menu_Items mi
             LEFT JOIN Productos p ON mi.id_producto = p.id_producto
             LEFT JOIN Categorias catp ON p.id_categoria = catp.id_categoria
             LEFT JOIN Combos cb ON mi.id_combo = cb.id_combo
             LEFT JOIN Categorias catc ON cb.id_categoria = catc.id_categoria
             WHERE mi.id_menu = $idMenu
             ORDER BY categoria ASC, tipo DESC, nombre ASC;"
        );

        return is_array($items) ? $items : [];
    }

    /** Agrupa items por categoria para la vista publica. */
    private function agruparPorCategoria(array $items)
    {
        $categorias = [];

        foreach ($items as $item) {
            $categoria = $item->categoria ?: "Sin categoria";

            if (!isset($categorias[$categoria])) {
                $categorias[$categoria] = [
                    "categoria" => $categoria,
                    "items" => [],
                ];
            }

            $categorias[$categoria]["items"][] = $item;
        }

        return array_values($categorias);
    }

    /** Comprueba que el menu exista. */
    private function comprobarMenu($db, $id)
    {
        $stmt = $db->prepare("SELECT id_menu FROM Menus WHERE id_menu = ? FOR UPDATE");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows === 0) {
            $stmt->close();
            throw new InvalidArgumentException("El menu solicitado no existe");
        }

        $stmt->close();
    }

    /** Comprueba productos activos. */
    private function comprobarProductosDisponibles($db, array $productos)
    {
        $stmt = $db->prepare(
            "SELECT id_producto FROM Productos WHERE id_producto = ? AND activo = 1"
        );

        foreach ($productos as $idProducto) {
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

    /** Comprueba combos activos. */
    private function comprobarCombosDisponibles($db, array $combos)
    {
        $stmt = $db->prepare("SELECT id_combo FROM Combos WHERE id_combo = ? AND activo = 1");

        foreach ($combos as $idCombo) {
            $stmt->bind_param("i", $idCombo);
            $stmt->execute();
            $resultado = $stmt->get_result();

            if ($resultado->num_rows === 0) {
                $stmt->close();
                throw new InvalidArgumentException(
                    "Uno de los combos seleccionados no esta disponible"
                );
            }
        }

        $stmt->close();
    }

    /** Cambia el estado activo del menu. */
    private function cambiarEstado($id, $activo, $mensaje)
    {
        $id = $this->validarId($id);

        $this->enlace->executeTransaction(function ($db) use ($id, $activo) {
            $this->comprobarMenu($db, $id);
            $stmt = $db->prepare("UPDATE Menus SET activo = ? WHERE id_menu = ?");
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

    /** Valida una lista de IDs sin duplicados. */
    private function validarIdsUnicos($entrada, $nombreCampo)
    {
        if (!is_array($entrada)) {
            return [];
        }

        $ids = [];
        $vistos = [];

        foreach ($entrada as $valor) {
            $id = filter_var($valor, FILTER_VALIDATE_INT);

            if ($id === false || $id <= 0) {
                throw new InvalidArgumentException("La seleccion de $nombreCampo no es valida");
            }
            if (isset($vistos[$id])) {
                throw new InvalidArgumentException("No se pueden repetir $nombreCampo");
            }

            $vistos[$id] = true;
            $ids[] = $id;
        }

        return $ids;
    }

    /** Normaliza HH:mm a HH:mm:ss. */
    private function normalizarHora($hora)
    {
        $hora = trim((string) $hora);

        if (preg_match('/^\d{2}:\d{2}$/', $hora)) {
            return $hora . ":00";
        }

        return $hora;
    }

    /** Valida fecha YYYY-MM-DD. */
    private function fechaValida($fecha)
    {
        $fecha = trim((string) $fecha);

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
            return false;
        }

        [$anio, $mes, $dia] = array_map('intval', explode('-', $fecha));
        return checkdate($mes, $dia, $anio);
    }

    /** Valida hora HH:mm:ss. */
    private function horaValida($hora)
    {
        return (bool) preg_match('/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/', $hora);
    }

    /** Convierte y valida un identificador. */
    private function validarId($id)
    {
        $idValidado = filter_var($id, FILTER_VALIDATE_INT);

        if ($idValidado === false || $idValidado <= 0) {
            throw new InvalidArgumentException("El identificador del menu no es valido");
        }

        return $idValidado;
    }
}
