<?php

class RolModel
{
    public $enlace;

    /** Inicializa el acceso del modelo a la base de datos. */
    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /** Obtiene todos los roles registrados. */
    public function all()
    {
        $vSql = "
            SELECT
                id_rol AS id,
                nombre_rol AS name,
                descripcion
            FROM roles
            ORDER BY id_rol ASC;
        ";

        return $this->enlace->executeSQL($vSql);
    }

    /** Obtiene un rol especifico por su ID. */
    public function get($id)
    {
        $id = intval($id);
        $vSql = "
            SELECT
                id_rol AS id,
                nombre_rol AS name,
                descripcion
            FROM roles
            WHERE id_rol = $id
            LIMIT 1;
        ";

        $resultado = $this->enlace->executeSQL($vSql);
        return !empty($resultado) && is_array($resultado) ? $resultado[0] : null;
    }

    /** Obtiene el rol asignado a un usuario. */
    public function getRolUser($idUser)
    {
        $idUser = intval($idUser);
        $vSql = "
            SELECT
                r.id_rol AS id,
                r.nombre_rol AS name
            FROM roles r
            INNER JOIN usuarios u ON r.id_rol = u.id_rol
            WHERE u.id_usuario = $idUser
            LIMIT 1;
        ";

        $resultado = $this->enlace->executeSQL($vSql);
        return !empty($resultado) && is_array($resultado) ? $resultado[0] : null;
    }
}
