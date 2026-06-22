<?php

class ProductoModel
{
    public $enlace;

    /** Inicializa el acceso del modelo a la base de datos. */
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /** Devuelve únicamente los productos activos del catálogo público. */
    public function all()
    {
        $vSQL = "
            SELECT
                p.id_producto AS id,
                p.nombre,
                p.descripcion,
                p.precio,
                p.imagen_url,
                c.nombre AS categoria
            FROM Productos p
            INNER JOIN Categorias c
                ON p.id_categoria = c.id_categoria
            WHERE p.activo = 1
            ORDER BY p.nombre ASC;
        ";

        return $this->enlace->executeSQL($vSQL);
    }

    /** Devuelve todos los productos para la pantalla administrativa. */
    public function allMantenimiento()
    {
        $vSQL = "
            SELECT
                p.id_producto AS id,
                p.nombre,
                p.descripcion,
                p.precio,
                p.imagen_url,
                p.activo,
                c.nombre AS categoria,
                COUNT(DISTINCT pi.id_ingrediente) AS cantidad_ingredientes,
                COUNT(DISTINCT ppc.id_estacion) AS cantidad_pasos
            FROM Productos p
            INNER JOIN Categorias c
                ON p.id_categoria = c.id_categoria
            LEFT JOIN Producto_Ingredientes pi
                ON p.id_producto = pi.id_producto
            LEFT JOIN Producto_Pasos_Cocina ppc
                ON p.id_producto = ppc.id_producto
            GROUP BY
                p.id_producto,
                p.nombre,
                p.descripcion,
                p.precio,
                p.imagen_url,
                p.activo,
                c.nombre
            ORDER BY p.id_producto ASC;
        ";

        return $this->enlace->executeSQL($vSQL);
    }

    /** Obtiene un producto con su categoría e ingredientes. */
    public function get($id)
    {
        $id = $this->validarId($id);

        $vSQL = "
            SELECT
                p.id_producto AS id,
                p.nombre,
                p.descripcion,
                p.precio,
                p.imagen_url,
                p.activo,
                p.id_categoria,
                c.nombre AS categoria
            FROM Productos p
            INNER JOIN Categorias c
                ON p.id_categoria = c.id_categoria
            WHERE p.id_producto = $id
            LIMIT 1;
        ";

        $vResultado = $this->enlace->executeSQL($vSQL);

        if (empty($vResultado) || !is_array($vResultado)) {
            return null;
        }

        $producto = $vResultado[0];
        $sqlIngredientes = "
            SELECT
                i.id_ingrediente,
                i.nombre,
                pi.cantidad_requerida,
                i.unidad_medida
            FROM Producto_Ingredientes pi
            INNER JOIN Ingredientes i
                ON pi.id_ingrediente = i.id_ingrediente
            WHERE pi.id_producto = $id
            ORDER BY i.nombre ASC;
        ";

        $ingredientes = $this->enlace->executeSQL($sqlIngredientes);
        $producto->ingredientes = is_array($ingredientes) ? $ingredientes : [];

        $sqlProceso = "
            SELECT
                e.id_estacion,
                e.nombre_estacion,
                e.descripcion,
                ppc.orden_paso
            FROM Producto_Pasos_Cocina ppc
            INNER JOIN Estaciones_Cocina e
                ON ppc.id_estacion = e.id_estacion
            WHERE ppc.id_producto = $id
            ORDER BY ppc.orden_paso ASC;
        ";

        $proceso = $this->enlace->executeSQL($sqlProceso);
        $producto->proceso_preparacion = is_array($proceso) ? $proceso : [];

        return $producto;
    }

    /** Crea el producto y sus ingredientes dentro de una transacción. */
    public function create($data)
    {
        $producto = $this->validarProducto($data);

        $id = $this->enlace->executeTransaction(function ($db) use ($producto) {
            $this->comprobarCategoria($db, $producto['id_categoria']);
            $this->comprobarIngredientesDisponibles($db, $producto['ingredientes']);
            $this->comprobarEstacionesDisponibles($db, $producto['proceso_preparacion']);
            $this->comprobarNombreDisponible($db, $producto['nombre']);

            $sql = "
                INSERT INTO Productos
                    (nombre, descripcion, precio, id_categoria, imagen_url, activo)
                VALUES (?, ?, ?, ?, ?, ?)
            ";
            $stmt = $db->prepare($sql);

            if (!$stmt) {
                throw new RuntimeException($db->error);
            }

            $stmt->bind_param(
                "ssdisi",
                $producto['nombre'],
                $producto['descripcion'],
                $producto['precio'],
                $producto['id_categoria'],
                $producto['imagen_url'],
                $producto['activo']
            );

            if (!$stmt->execute()) {
                if ($stmt->errno === 1062) {
                    throw new InvalidArgumentException(
                        "Ya existe un producto con ese nombre"
                    );
                }
                throw new RuntimeException($stmt->error);
            }

            $idProducto = $db->insert_id;
            $stmt->close();
            $this->insertarIngredientes($db, $idProducto, $producto['ingredientes']);
            $this->insertarProcesoPreparacion(
                $db,
                $idProducto,
                $producto['proceso_preparacion']
            );

            return $idProducto;
        });

        return $this->get($id);
    }

    /** Actualiza el producto y reemplaza sus relaciones de ingredientes. */
    public function update($id, $data)
    {
        $id = $this->validarId($id);
        $producto = $this->validarProducto($data);

        $this->enlace->executeTransaction(function ($db) use ($id, $producto) {
            $this->comprobarProducto($db, $id);
            $this->comprobarCategoria($db, $producto['id_categoria']);
            $this->comprobarIngredientesDisponibles($db, $producto['ingredientes']);
            $this->comprobarEstacionesDisponibles($db, $producto['proceso_preparacion']);
            $this->comprobarNombreDisponible($db, $producto['nombre'], $id);

            $sql = "
                UPDATE Productos
                SET nombre = ?, descripcion = ?, precio = ?, id_categoria = ?,
                    imagen_url = ?, activo = ?
                WHERE id_producto = ?
            ";
            $stmt = $db->prepare($sql);

            if (!$stmt) {
                throw new RuntimeException($db->error);
            }

            $stmt->bind_param(
                "ssdisii",
                $producto['nombre'],
                $producto['descripcion'],
                $producto['precio'],
                $producto['id_categoria'],
                $producto['imagen_url'],
                $producto['activo'],
                $id
            );

            if (!$stmt->execute()) {
                if ($stmt->errno === 1062) {
                    throw new InvalidArgumentException(
                        "Ya existe un producto con ese nombre"
                    );
                }
                throw new RuntimeException($stmt->error);
            }
            $stmt->close();

            $stmt = $db->prepare(
                "DELETE FROM Producto_Ingredientes WHERE id_producto = ?"
            );
            $stmt->bind_param("i", $id);

            if (!$stmt->execute()) {
                throw new RuntimeException($stmt->error);
            }
            $stmt->close();

            $this->insertarIngredientes($db, $id, $producto['ingredientes']);

            $stmt = $db->prepare(
                "DELETE FROM Producto_Pasos_Cocina WHERE id_producto = ?"
            );
            $stmt->bind_param("i", $id);

            if (!$stmt->execute()) {
                throw new RuntimeException($stmt->error);
            }
            $stmt->close();

            $this->insertarProcesoPreparacion(
                $db,
                $id,
                $producto['proceso_preparacion']
            );
        });

        return $this->get($id);
    }

    /** Desactiva un producto sin borrar el registro ni sus relaciones. */
    public function delete($id)
    {
        return $this->cambiarEstado($id, 0, "Producto desactivado correctamente");
    }

    /** Reactiva un producto previamente desactivado. */
    public function activar($id)
    {
        return $this->cambiarEstado($id, 1, "Producto activado correctamente");
    }

    /** Devuelve las categorías disponibles para formularios. */
    public function getCategorias()
    {
        return $this->enlace->executeSQL(
            "SELECT id_categoria AS id, nombre FROM Categorias ORDER BY nombre ASC;"
        );
    }

    /** Devuelve los ingredientes activos para formularios. */
    public function getIngredientes()
    {
        return $this->enlace->executeSQL(
            "SELECT id_ingrediente, nombre, unidad_medida
             FROM Ingredientes
             WHERE activo = 1
             ORDER BY nombre ASC;"
        );
    }

    /** Devuelve las estaciones disponibles para configurar procesos. */
    public function getEstaciones()
    {
        return $this->enlace->executeSQL(
            "SELECT id_estacion, nombre_estacion, descripcion
             FROM Estaciones_Cocina
             ORDER BY nombre_estacion ASC;"
        );
    }

    /** Valida y normaliza el cuerpo recibido desde la API. */
    private function validarProducto($data)
    {
        if (!is_object($data)) {
            throw new InvalidArgumentException("Los datos del producto no son válidos");
        }

        $nombre = trim((string) ($data->nombre ?? ""));
        $descripcion = trim((string) ($data->descripcion ?? ""));
        $precio = filter_var($data->precio ?? null, FILTER_VALIDATE_FLOAT);
        $idCategoria = filter_var($data->id_categoria ?? null, FILTER_VALIDATE_INT);
        $imagenUrl = trim((string) ($data->imagen_url ?? ""));
        $activo = isset($data->activo) && (int) $data->activo === 0 ? 0 : 1;
        $ingredientesEntrada = $data->ingredientes ?? null;
        $procesoEntrada = $data->proceso_preparacion ?? null;

        if ($nombre === "") {
            throw new InvalidArgumentException("El nombre es requerido");
        }
        if ($descripcion === "") {
            throw new InvalidArgumentException("La descripción es requerida");
        }
        if ($precio === false || $precio <= 0) {
            throw new InvalidArgumentException("El precio debe ser mayor que cero");
        }
        if ($idCategoria === false || $idCategoria <= 0) {
            throw new InvalidArgumentException("La categoría es requerida");
        }
        if (!is_array($ingredientesEntrada) || count($ingredientesEntrada) === 0) {
            throw new InvalidArgumentException("Debe seleccionar al menos un ingrediente");
        }
        if (!is_array($procesoEntrada) || count($procesoEntrada) === 0) {
            throw new InvalidArgumentException(
                "Debe seleccionar al menos una estación de preparación"
            );
        }

        $ingredientes = [];
        $idsUtilizados = [];

        foreach ($ingredientesEntrada as $ingrediente) {
            if (!is_object($ingrediente)) {
                throw new InvalidArgumentException("La información de ingredientes no es válida");
            }

            $idIngrediente = filter_var(
                $ingrediente->id_ingrediente ?? null,
                FILTER_VALIDATE_INT
            );
            $cantidad = filter_var(
                $ingrediente->cantidad_requerida ?? null,
                FILTER_VALIDATE_FLOAT
            );

            if ($idIngrediente === false || $idIngrediente <= 0) {
                throw new InvalidArgumentException("Seleccione un ingrediente válido");
            }
            if ($cantidad === false || $cantidad <= 0) {
                throw new InvalidArgumentException(
                    "Las cantidades de ingredientes deben ser mayores que cero"
                );
            }
            if (isset($idsUtilizados[$idIngrediente])) {
                throw new InvalidArgumentException("No se pueden repetir ingredientes");
            }

            $idsUtilizados[$idIngrediente] = true;
            $ingredientes[] = [
                'id_ingrediente' => $idIngrediente,
                'cantidad_requerida' => (float) $cantidad,
            ];
        }

        $procesoPreparacion = [];
        $estacionesUtilizadas = [];
        $ordenesUtilizados = [];

        foreach ($procesoEntrada as $paso) {
            if (!is_object($paso)) {
                throw new InvalidArgumentException(
                    "La información del proceso de preparación no es válida"
                );
            }

            $idEstacion = filter_var(
                $paso->id_estacion ?? null,
                FILTER_VALIDATE_INT
            );
            $ordenPaso = filter_var(
                $paso->orden_paso ?? null,
                FILTER_VALIDATE_INT
            );

            if ($idEstacion === false || $idEstacion <= 0) {
                throw new InvalidArgumentException("Seleccione una estación válida");
            }
            if ($ordenPaso === false || $ordenPaso <= 0) {
                throw new InvalidArgumentException(
                    "El orden de cada estación debe ser mayor que cero"
                );
            }
            if (isset($estacionesUtilizadas[$idEstacion])) {
                throw new InvalidArgumentException(
                    "No se pueden repetir estaciones de preparación"
                );
            }
            if (isset($ordenesUtilizados[$ordenPaso])) {
                throw new InvalidArgumentException(
                    "No se pueden repetir órdenes en el proceso de preparación"
                );
            }

            $estacionesUtilizadas[$idEstacion] = true;
            $ordenesUtilizados[$ordenPaso] = true;
            $procesoPreparacion[] = [
                'id_estacion' => $idEstacion,
                'orden_paso' => $ordenPaso,
            ];
        }

        usort($procesoPreparacion, function ($pasoA, $pasoB) {
            return $pasoA['orden_paso'] <=> $pasoB['orden_paso'];
        });

        return [
            'nombre' => $nombre,
            'descripcion' => $descripcion,
            'precio' => (float) $precio,
            'id_categoria' => $idCategoria,
            'imagen_url' => $imagenUrl === "" ? null : $imagenUrl,
            'activo' => $activo,
            'ingredientes' => $ingredientes,
            'proceso_preparacion' => $procesoPreparacion,
        ];
    }

    /** Inserta las relaciones de ingredientes usando la conexión transaccional. */
    private function insertarIngredientes($db, $idProducto, array $ingredientes)
    {
        $stmt = $db->prepare(
            "INSERT INTO Producto_Ingredientes
                (id_producto, id_ingrediente, cantidad_requerida)
             VALUES (?, ?, ?)"
        );

        if (!$stmt) {
            throw new RuntimeException($db->error);
        }

        foreach ($ingredientes as $ingrediente) {
            $idIngrediente = $ingrediente['id_ingrediente'];
            $cantidad = $ingrediente['cantidad_requerida'];
            $stmt->bind_param("iid", $idProducto, $idIngrediente, $cantidad);

            if (!$stmt->execute()) {
                throw new RuntimeException($stmt->error);
            }
        }

        $stmt->close();
    }

    /** Inserta las estaciones y su orden dentro de la transacción del producto. */
    private function insertarProcesoPreparacion($db, $idProducto, array $proceso)
    {
        $stmt = $db->prepare(
            "INSERT INTO Producto_Pasos_Cocina
                (id_producto, id_estacion, orden_paso)
             VALUES (?, ?, ?)"
        );

        if (!$stmt) {
            throw new RuntimeException($db->error);
        }

        foreach ($proceso as $paso) {
            $idEstacion = $paso['id_estacion'];
            $ordenPaso = $paso['orden_paso'];
            $stmt->bind_param("iii", $idProducto, $idEstacion, $ordenPaso);

            if (!$stmt->execute()) {
                throw new RuntimeException($stmt->error);
            }
        }

        $stmt->close();
    }

    /** Verifica la existencia del producto y bloquea el registro durante la operación. */
    private function comprobarProducto($db, $id)
    {
        $stmt = $db->prepare(
            "SELECT id_producto FROM Productos WHERE id_producto = ? FOR UPDATE"
        );
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows === 0) {
            $stmt->close();
            throw new InvalidArgumentException("El producto solicitado no existe");
        }

        $stmt->close();
    }

    /** Comprueba que la categoría seleccionada exista. */
    private function comprobarCategoria($db, $idCategoria)
    {
        $stmt = $db->prepare(
            "SELECT id_categoria FROM Categorias WHERE id_categoria = ?"
        );
        $stmt->bind_param("i", $idCategoria);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows === 0) {
            $stmt->close();
            throw new InvalidArgumentException("La categoría seleccionada no existe");
        }

        $stmt->close();
    }

    /** Comprueba que todos los ingredientes seleccionados estén disponibles. */
    private function comprobarIngredientesDisponibles($db, array $ingredientes)
    {
        $stmt = $db->prepare(
            "SELECT id_ingrediente
             FROM Ingredientes
             WHERE id_ingrediente = ? AND activo = 1"
        );

        foreach ($ingredientes as $ingrediente) {
            $idIngrediente = $ingrediente['id_ingrediente'];
            $stmt->bind_param("i", $idIngrediente);
            $stmt->execute();
            $resultado = $stmt->get_result();

            if ($resultado->num_rows === 0) {
                $stmt->close();
                throw new InvalidArgumentException(
                    "Uno de los ingredientes seleccionados no está disponible"
                );
            }
        }

        $stmt->close();
    }

    /** Comprueba que todas las estaciones seleccionadas existan en el catálogo. */
    private function comprobarEstacionesDisponibles($db, array $proceso)
    {
        $stmt = $db->prepare(
            "SELECT id_estacion FROM Estaciones_Cocina WHERE id_estacion = ?"
        );

        foreach ($proceso as $paso) {
            $idEstacion = $paso['id_estacion'];
            $stmt->bind_param("i", $idEstacion);
            $stmt->execute();
            $resultado = $stmt->get_result();

            if ($resultado->num_rows === 0) {
                $stmt->close();
                throw new InvalidArgumentException(
                    "Una de las estaciones seleccionadas no existe"
                );
            }
        }

        $stmt->close();
    }

    /** Evita infringir el nombre único de productos. */
    private function comprobarNombreDisponible($db, $nombre, $idExcluir = null)
    {
        if ($idExcluir === null) {
            $stmt = $db->prepare(
                "SELECT id_producto FROM Productos WHERE nombre = ?"
            );
            $stmt->bind_param("s", $nombre);
        } else {
            $stmt = $db->prepare(
                "SELECT id_producto
                 FROM Productos
                 WHERE nombre = ? AND id_producto <> ?"
            );
            $stmt->bind_param("si", $nombre, $idExcluir);
        }

        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows > 0) {
            $stmt->close();
            throw new InvalidArgumentException("Ya existe un producto con ese nombre");
        }

        $stmt->close();
    }

    /** Cambia únicamente el indicador activo del producto. */
    private function cambiarEstado($id, $activo, $mensaje)
    {
        $id = $this->validarId($id);

        $this->enlace->executeTransaction(function ($db) use ($id, $activo) {
            $this->comprobarProducto($db, $id);
            $stmt = $db->prepare(
                "UPDATE Productos SET activo = ? WHERE id_producto = ?"
            );
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

    /** Convierte y valida un identificador recibido por URL. */
    private function validarId($id)
    {
        $idValidado = filter_var($id, FILTER_VALIDATE_INT);

        if ($idValidado === false || $idValidado <= 0) {
            throw new InvalidArgumentException("El identificador del producto no es válido");
        }

        return $idValidado;
    }
}
