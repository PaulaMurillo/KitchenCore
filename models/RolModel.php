<?php
class RolModel{
    public $enlace;
    /** Inicializa el acceso del modelo a la base de datos. */
    public function __construct() {
        
        $this->enlace=new MySqlConnect();
       
    }
    /** Obtiene todos los roles registrados. */
    public function all(){
        try {
            //Consulta sql
			$vSql = "SELECT * FROM rol;";
			
            //Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL ( $vSql);
				
			// Retornar el objeto
			return $vResultado;
		} catch ( Exception $e ) {
			die ( $e->getMessage () );
		}
    }

    /** Obtiene un rol específico por su ID. */
    public function get($id){
        try {
            //Consulta sql
			$vSql = "SELECT * FROM rol where id=$id";
			
            //Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL ( $vSql);
			// Retornar el objeto
			return $vResultado[0];
		} catch ( Exception $e ) {
			die ( $e->getMessage () );
		}
    }
    /** Obtiene el rol asignado a un usuario. */
    public function getRolUser($idUser){
        try {
            //Consulta sql
			$vSql = "SELECT r.id,r.name
            FROM rol r,user u 
            where r.id=u.rol_id and u.id=$idUser";
			
            //Ejecutar la consulta
			$vResultado = $this->enlace->ExecuteSQL ( $vSql);
			// Retornar el objeto
			return $vResultado[0];
		} catch ( Exception $e ) {
			die ( $e->getMessage () );
		}
    }
	
}
