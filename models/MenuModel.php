<?php

class MenuModel
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
                    m.id_menu AS id,
                    m.nombre,
                    m.fecha_inicio,
                    m.fecha_fin,
                    m.hora_inicio,
                    m.hora_fin,
                    m.activo,
                    CASE 
                        WHEN m.activo = 1 
                        AND CURDATE() BETWEEN m.fecha_inicio AND m.fecha_fin
                        AND CURTIME() BETWEEN m.hora_inicio AND m.hora_fin
                        THEN 'Disponible'
                        WHEN m.fecha_inicio > CURDATE()
                        THEN 'Próximo'
                        ELSE 'No disponible'
                    END AS estado
                FROM Menus m
                ORDER BY m.fecha_inicio DESC, m.hora_inicio DESC;
            ";

            return $this->enlace->executeSQL($vSQL);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function disponible()
    {
        try {
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
                ORDER BY m.fecha_inicio DESC, m.hora_inicio DESC
                LIMIT 1;
            ";

            $resultadoMenu = $this->enlace->executeSQL($sqlMenu);

            if (empty($resultadoMenu) || !is_array($resultadoMenu)) {
                return null;
            }

            $menu = $resultadoMenu[0];
            $idMenu = intval($menu->id);

            $sqlItems = "
                SELECT 
                    mi.id_menu_item AS id,
                    CASE 
                        WHEN mi.id_producto IS NOT NULL THEN 'Producto'
                        ELSE 'Combo'
                    END AS tipo,
                    COALESCE(p.nombre, cb.nombre) AS nombre,
                    COALESCE(p.descripcion, cb.descripcion) AS descripcion,
                    COALESCE(p.precio, cb.precio_especial) AS precio,
                    COALESCE(catp.nombre, catc.nombre) AS categoria
                FROM Menu_Items mi
                LEFT JOIN Productos p 
                    ON mi.id_producto = p.id_producto
                LEFT JOIN Categorias catp 
                    ON p.id_categoria = catp.id_categoria
                LEFT JOIN Combos cb 
                    ON mi.id_combo = cb.id_combo
                LEFT JOIN Categorias catc 
                    ON cb.id_categoria = catc.id_categoria
                WHERE mi.id_menu = $idMenu
                ORDER BY categoria ASC, tipo DESC, nombre ASC;
            ";

            $items = $this->enlace->executeSQL($sqlItems);

            $categorias = [];

            if (!empty($items) && is_array($items)) {
                foreach ($items as $item) {
                    $categoria = $item->categoria;

                    if (!isset($categorias[$categoria])) {
                        $categorias[$categoria] = [
                            "categoria" => $categoria,
                            "items" => []
                        ];
                    }

                    $categorias[$categoria]["items"][] = $item;
                }
            }

            $menu->categorias = array_values($categorias);

            return $menu;
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function get($id)
    {
        if ($id === "disponible") {
            return $this->disponible();
        }

        return null;
    }
}