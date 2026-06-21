<?php

class ProductoModel
{
    public $enlace;

    /** Inicializa el acceso del modelo a la base de datos. */
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /**
     * Listar todos los productos activos
     * @return array|null
     */
    public function all()
    {
        try {
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

            $vResultado = $this->enlace->executeSQL($vSQL);

            return $vResultado;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /**
     * Obtener un producto por ID con sus ingredientes
     * @param int $id
     * @return object|null
     */
    public function get($id)
    {
        try {
            $id = intval($id);

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
                WHERE p.id_producto = $id
                LIMIT 1;
            ";

            $vResultado = $this->enlace->executeSQL($vSQL);

            if (!empty($vResultado) && is_array($vResultado)) {
                $producto = $vResultado[0];

                $sqlIngredientes = "
                    SELECT 
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

                if (!empty($ingredientes) && is_array($ingredientes)) {
                    $producto->ingredientes = $ingredientes;
                } else {
                    $producto->ingredientes = [];
                }

                return $producto;
            }

            return null;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
