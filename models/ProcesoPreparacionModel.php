<?php

class ProcesoPreparacionModel
{
    public $enlace;

    /** Inicializa el acceso del modelo a la base de datos. */
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /** Obtiene los productos y la cantidad de estaciones de cada proceso. */
    public function all()
    {
        return $this->allMantenimiento();
    }

    /** Obtiene procesos para mantenimiento. */
    public function allMantenimiento()
    {
        $vSQL = "
            SELECT
                p.id_producto AS id,
                p.nombre AS producto,
                IFNULL(COUNT(ppc.id_estacion), 0) AS cantidad_pasos,
                CASE
                    WHEN COUNT(ppc.id_estacion) > 0 THEN 'Configurado'
                    ELSE 'Sin configurar'
                END AS estado_configuracion
            FROM Productos p
            LEFT JOIN Producto_Pasos_Cocina ppc ON p.id_producto = ppc.id_producto
            WHERE p.activo = 1
            GROUP BY p.id_producto, p.nombre
            ORDER BY p.nombre ASC;
        ";

        $resultado = $this->enlace->executeSQL($vSQL);
        return is_array($resultado) ? $resultado : [];
    }

    /** Obtiene el detalle de un proceso con sus estaciones en orden. */
    public function get($id)
    {
        $id = $this->validarId($id);

        $sqlProducto = "
            SELECT
                p.id_producto AS id,
                p.nombre AS producto,
                p.descripcion
            FROM Productos p
            WHERE p.id_producto = $id
            LIMIT 1;
        ";

        $resultadoProducto = $this->enlace->executeSQL($sqlProducto);

        if (empty($resultadoProducto) || !is_array($resultadoProducto)) {
            return null;
        }

        $proceso = $resultadoProducto[0];
        $sqlEstaciones = "
            SELECT
                e.id_estacion,
                e.id_estacion AS id,
                e.nombre_estacion,
                e.descripcion,
                ppc.orden_paso
            FROM Producto_Pasos_Cocina ppc
            INNER JOIN Estaciones_Cocina e ON ppc.id_estacion = e.id_estacion
            WHERE ppc.id_producto = $id
            ORDER BY ppc.orden_paso ASC;
        ";

        $estaciones = $this->enlace->executeSQL($sqlEstaciones);
        $proceso->estaciones = is_array($estaciones) ? $estaciones : [];
        $proceso->cantidad_pasos = count($proceso->estaciones);

        return $proceso;
    }

    /** Crea el proceso de un producto que aun no tiene pasos. */
    public function create($data)
    {
        $proceso = $this->validarProceso($data);

        $this->enlace->executeTransaction(function ($db) use ($proceso) {
            $this->comprobarProducto($db, $proceso['id_producto']);
            $this->comprobarEstacionesDisponibles($db, $proceso['estaciones']);

            $stmt = $db->prepare(
                "SELECT COUNT(*) AS total FROM Producto_Pasos_Cocina WHERE id_producto = ?"
            );
            $stmt->bind_param("i", $proceso['id_producto']);
            $stmt->execute();
            $resultado = $stmt->get_result()->fetch_assoc();
            $stmt->close();

            if ((int) $resultado['total'] > 0) {
                throw new InvalidArgumentException(
                    "El producto ya tiene un proceso; use la opcion de editar"
                );
            }

            $this->insertarEstaciones($db, $proceso['id_producto'], $proceso['estaciones']);
        });

        return $this->get($proceso['id_producto']);
    }

    /** Reemplaza los pasos del proceso de un producto. */
    public function update($id, $data)
    {
        $id = $this->validarId($id);
        $proceso = $this->validarProceso($data, $id);

        $this->enlace->executeTransaction(function ($db) use ($id, $proceso) {
            $this->comprobarProducto($db, $id);
            $this->comprobarEstacionesDisponibles($db, $proceso['estaciones']);

            $stmt = $db->prepare("DELETE FROM Producto_Pasos_Cocina WHERE id_producto = ?");
            $stmt->bind_param("i", $id);
            if (!$stmt->execute()) {
                throw new RuntimeException($stmt->error);
            }
            $stmt->close();

            $this->insertarEstaciones($db, $id, $proceso['estaciones']);
        });

        return $this->get($id);
    }

    /** Devuelve productos activos para formularios. */
    public function getProductos()
    {
        return $this->enlace->executeSQL(
            "SELECT id_producto AS id, nombre
             FROM Productos
             WHERE activo = 1
             ORDER BY nombre ASC;"
        );
    }

    /** Devuelve estaciones de cocina. */
    public function getEstaciones()
    {
        return $this->enlace->executeSQL(
            "SELECT id_estacion, nombre_estacion, descripcion
             FROM Estaciones_Cocina
             ORDER BY nombre_estacion ASC;"
        );
    }

    /** Valida y normaliza el cuerpo recibido. */
    private function validarProceso($data, $idProductoForzado = null)
    {
        if (!is_object($data)) {
            throw new InvalidArgumentException("Los datos del proceso no son validos");
        }

        $idProducto = $idProductoForzado ?? filter_var(
            $data->id_producto ?? null,
            FILTER_VALIDATE_INT
        );
        $estacionesEntrada = $data->estaciones ?? null;

        if ($idProducto === false || $idProducto <= 0) {
            throw new InvalidArgumentException("Debe seleccionar un producto valido");
        }
        if (!is_array($estacionesEntrada) || count($estacionesEntrada) === 0) {
            throw new InvalidArgumentException("Debe seleccionar al menos una estacion");
        }

        $estaciones = [];
        $estacionesUtilizadas = [];
        $ordenesUtilizados = [];

        foreach ($estacionesEntrada as $paso) {
            if (!is_object($paso)) {
                throw new InvalidArgumentException("La informacion de estaciones no es valida");
            }

            $idEstacion = filter_var($paso->id_estacion ?? null, FILTER_VALIDATE_INT);
            $ordenPaso = filter_var($paso->orden_paso ?? null, FILTER_VALIDATE_INT);

            if ($idEstacion === false || $idEstacion <= 0) {
                throw new InvalidArgumentException("Seleccione una estacion valida");
            }
            if ($ordenPaso === false || $ordenPaso <= 0) {
                throw new InvalidArgumentException("El orden debe ser mayor que cero");
            }
            if (isset($estacionesUtilizadas[$idEstacion])) {
                throw new InvalidArgumentException("No se pueden repetir estaciones");
            }
            if (isset($ordenesUtilizados[$ordenPaso])) {
                throw new InvalidArgumentException("No se pueden repetir ordenes");
            }

            $estacionesUtilizadas[$idEstacion] = true;
            $ordenesUtilizados[$ordenPaso] = true;
            $estaciones[] = [
                'id_estacion' => $idEstacion,
                'orden_paso' => $ordenPaso,
            ];
        }

        usort($estaciones, function ($pasoA, $pasoB) {
            return $pasoA['orden_paso'] <=> $pasoB['orden_paso'];
        });

        return [
            'id_producto' => (int) $idProducto,
            'estaciones' => $estaciones,
        ];
    }

    /** Inserta las estaciones del proceso. */
    private function insertarEstaciones($db, $idProducto, array $estaciones)
    {
        $stmt = $db->prepare(
            "INSERT INTO Producto_Pasos_Cocina (id_producto, id_estacion, orden_paso)
             VALUES (?, ?, ?)"
        );

        if (!$stmt) {
            throw new RuntimeException($db->error);
        }

        foreach ($estaciones as $paso) {
            $idEstacion = $paso['id_estacion'];
            $ordenPaso = $paso['orden_paso'];
            $stmt->bind_param("iii", $idProducto, $idEstacion, $ordenPaso);

            if (!$stmt->execute()) {
                throw new RuntimeException($stmt->error);
            }
        }

        $stmt->close();
    }

    /** Comprueba que el producto exista. */
    private function comprobarProducto($db, $id)
    {
        $stmt = $db->prepare("SELECT id_producto FROM Productos WHERE id_producto = ? FOR UPDATE");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows === 0) {
            $stmt->close();
            throw new InvalidArgumentException("El producto solicitado no existe");
        }

        $stmt->close();
    }

    /** Comprueba que las estaciones existan. */
    private function comprobarEstacionesDisponibles($db, array $estaciones)
    {
        $stmt = $db->prepare("SELECT id_estacion FROM Estaciones_Cocina WHERE id_estacion = ?");

        foreach ($estaciones as $paso) {
            $idEstacion = $paso['id_estacion'];
            $stmt->bind_param("i", $idEstacion);
            $stmt->execute();
            $resultado = $stmt->get_result();

            if ($resultado->num_rows === 0) {
                $stmt->close();
                throw new InvalidArgumentException("Una de las estaciones seleccionadas no existe");
            }
        }

        $stmt->close();
    }

    /** Convierte y valida un identificador. */
    private function validarId($id)
    {
        $idValidado = filter_var($id, FILTER_VALIDATE_INT);

        if ($idValidado === false || $idValidado <= 0) {
            throw new InvalidArgumentException("El identificador del proceso no es valido");
        }

        return $idValidado;
    }
}
