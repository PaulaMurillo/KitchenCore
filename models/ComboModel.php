<?php

class ComboModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function all()
    {
        try {
            $vSQL = "
                SELECT 
                    cb.id_combo AS id,
                    cb.nombre,
                    cb.descripcion,
                    cb.precio_especial,
                    COUNT(cp.id_producto) AS cantidad_productos
                FROM Combos cb
                LEFT JOIN Combo_Productos cp 
                    ON cb.id_combo = cp.id_combo
                WHERE cb.activo = 1
                GROUP BY 
                    cb.id_combo,
                    cb.nombre,
                    cb.descripcion,
                    cb.precio_especial
                ORDER BY cb.nombre ASC;
            ";

            return $this->enlace->executeSQL($vSQL);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function get($id)
    {
        try {
            $id = intval($id);

            $vSQL = "
                SELECT 
                    cb.id_combo AS id,
                    cb.nombre,
                    cb.descripcion,
                    cb.precio_especial
                FROM Combos cb
                WHERE cb.id_combo = $id
                LIMIT 1;
            ";

            $vResultado = $this->enlace->executeSQL($vSQL);

            if (!empty($vResultado) && is_array($vResultado)) {
                $combo = $vResultado[0];

                $sqlProductos = "
                    SELECT 
                        p.id_producto AS id,
                        p.nombre,
                        p.descripcion,
                        p.precio,
                        cp.cantidad
                    FROM Combo_Productos cp
                    INNER JOIN Productos p 
                        ON cp.id_producto = p.id_producto
                    WHERE cp.id_combo = $id
                    ORDER BY p.nombre ASC;
                ";

                $productos = $this->enlace->executeSQL($sqlProductos);

                if (!empty($productos) && is_array($productos)) {
                    $combo->productos = $productos;
                } else {
                    $combo->productos = [];
                }

                return $combo;
            }

            return null;
        } catch (Exception $e) {
            handleException($e);
        }
    }
}