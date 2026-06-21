<?php
//Cargar todos los paquetes
require_once "vendor/autoload.php";

use Firebase\JWT\JWT;

class user
{

    private $secret_key = 'e0d17975bc9bd57eee132eecb6da6f11048e8a88506cc3bffc7249078cf2a77a';
    /** Devuelve el listado completo de usuarios en formato JSON. */
    public function index()
    {
        $response = new Response();
        //Obtener el listado del Modelo
        $usuario = new UserModel();
        $result = $usuario->all();
        //Dar respuesta
        $response->toJSON($result);
    }
    /** Devuelve un usuario específico según el ID recibido. */
    public function get($param)
    {
        $response = new Response();
        $usuario = new UserModel();
        $result = $usuario->get($param);
        //Dar respuesta
        $response->toJSON($result);
    }
    /** Devuelve el listado de usuarios con rol de cliente. */
    public function allCustomer()
    {
        $response = new Response();
        //Obtener el listado del Modelo
        $usuario = new UserModel();
        $result = $usuario->allCustomer();
        //Dar respuesta
        $response->toJSON($result);
    }
    /** Procesa las credenciales y devuelve el token de autenticación. */
    public function login()
    {
        $response = new Response();
        $request = new Request();
        //Obtener json enviado
        $inputJSON = $request->getJSON();
        $usuario = new UserModel();
        $result = $usuario->login($inputJSON);
        if (isset($result) && !empty($result) && $result != false) {
            $response->toJSON($result);
        } else {
            $response->toJSON($response, "Usuario no valido");
        }
    }
    /** Procesa la solicitud para registrar un usuario. */
    public function create()
    {
        $response = new Response();
        $request = new Request();
        //Obtener json enviado
        $inputJSON = $request->getJSON();
        $usuario = new UserModel();
        $result = $usuario->create($inputJSON);
        //Dar respuesta
        $response->toJSON($result);
    }
}
