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
        try {
            $vSQL = "
                SELECT 
                    p.id_producto AS id,
                    p.nombre AS producto,
                    IFNULL(COUNT(ppc.id_estacion), 0) AS cantidad_pasos
                FROM Productos p
                LEFT JOIN Producto_Pasos_Cocina ppc 
                    ON p.id_producto = ppc.id_producto
                WHERE p.activo = 1
                GROUP BY p.id_producto, p.nombre
                ORDER BY p.nombre ASC;
            ";

            $resultado = $this->enlace->executeSQL($vSQL);

            if (!empty($resultado) && is_array($resultado)) {
                return $resultado;
            }

            return [];
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /** Obtiene el detalle de un proceso con sus estaciones en orden. */
    public function get($id)
    {
        try {
            $id = intval($id);

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

            if (!empty($resultadoProducto) && is_array($resultadoProducto)) {
                $proceso = $resultadoProducto[0];

                $sqlEstaciones = "
                    SELECT 
                        e.id_estacion AS id,
                        e.nombre_estacion,
                        e.descripcion,
                        ppc.orden_paso
                    FROM Producto_Pasos_Cocina ppc
                    INNER JOIN Estaciones_Cocina e 
                        ON ppc.id_estacion = e.id_estacion
                    WHERE ppc.id_producto = $id
                    ORDER BY ppc.orden_paso ASC;
                ";

                $estaciones = $this->enlace->executeSQL($sqlEstaciones);

                if (!empty($estaciones) && is_array($estaciones)) {
                    $proceso->estaciones = $estaciones;
                    $proceso->cantidad_pasos = count($estaciones);
                } else {
                    $proceso->estaciones = [];
                    $proceso->cantidad_pasos = 0;
                }

                return $proceso;
            }

            return null;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
