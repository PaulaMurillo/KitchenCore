<?php
require_once "vendor/autoload.php";

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class user
{
    /** Devuelve el listado completo de usuarios en formato JSON. */
    public function index()
    {
        try {
            $response = new Response();
            $usuario = new UserModel();
            $response->toJSON($usuario->all());
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Resuelve detalle, perfil, roles y mantenimiento. */
    public function get($param)
    {
        try {
            $response = new Response();
            $usuario = new UserModel();

            if ($param === "mantenimiento") {
                $result = $usuario->allMantenimiento();
            } elseif ($param === "roles") {
                $result = $usuario->getRoles();
            } elseif ($param === "perfil") {
                $idUsuario = $this->obtenerUsuarioAutenticadoId();
                $result = $usuario->getPerfil($idUsuario);
            } elseif (ctype_digit((string) $param)) {
                $result = $usuario->get($param);

                if ($result === null) {
                    $response->status(404)->toJSON(['error' => 'Usuario no encontrado']);
                    return;
                }
            } else {
                $response->status(400)->toJSON(['error' => 'Solicitud de usuario no valida']);
                return;
            }

            $response->toJSON($result);
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Devuelve el listado de usuarios con rol de cliente. */
    public function allCustomer()
    {
        try {
            $response = new Response();
            $usuario = new UserModel();
            $response->toJSON($usuario->allCustomer());
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Procesa las credenciales y devuelve el token de autenticacion. */
    public function login()
    {
        try {
            $response = new Response();
            $request = new Request();
            $usuario = new UserModel();
            $result = $usuario->login($request->getJSON());

            if (isset($result) && !empty($result) && $result !== false) {
                $response->toJSON($result);
            } else {
                $response->toJSON("Usuario no valido");
            }
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Procesa el registro publico o la creacion administrativa. */
    public function create()
    {
        try {
            $response = new Response();
            $request = new Request();
            $usuario = new UserModel();
            $inputJSON = $request->getJSON();

            if ($this->esCreacionAdministrativa()) {
                $result = $usuario->create($inputJSON);
            } else {
                $result = $usuario->register($inputJSON);
            }

            $response->status(201)->toJSON($result);
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Actualiza un usuario desde mantenimiento. */
    public function update($id)
    {
        try {
            $request = new Request();
            $usuario = new UserModel();
            (new Response())->toJSON($usuario->update($id, $request->getJSON()));
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Actualiza el perfil propio del usuario autenticado. */
    public function updatePerfil()
    {
        try {
            $request = new Request();
            $usuario = new UserModel();
            $idUsuario = $this->obtenerUsuarioAutenticadoId();
            (new Response())->toJSON($usuario->updatePerfil($idUsuario, $request->getJSON()));
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Realiza eliminacion logica mediante activo = 0. */
    public function delete($id)
    {
        try {
            $usuario = new UserModel();
            (new Response())->toJSON($usuario->delete($id));
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Reactiva un usuario desactivado. */
    public function activar($id)
    {
        try {
            $usuario = new UserModel();
            (new Response())->toJSON($usuario->activar($id));
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Indica si la peticion usa la ruta administrativa /user/create. */
    private function esCreacionAdministrativa()
    {
        return (bool) preg_match('#/user/create/?$#i', $_SERVER['REQUEST_URI'] ?? "");
    }

    /** Obtiene el id del usuario desde el JWT de Authorization. */
    private function obtenerUsuarioAutenticadoId()
    {
        $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? "";

        if (!$authorization && function_exists('getallheaders')) {
            $headers = getallheaders();
            $authorization = $headers['Authorization'] ?? $headers['authorization'] ?? "";
        }

        if (!preg_match('/Bearer\s+(.+)/i', $authorization, $matches)) {
            throw new InvalidArgumentException("Debe iniciar sesion para ver el perfil");
        }

        $token = trim($matches[1]);
        $decoded = JWT::decode($token, new Key(Config::get('SECRET_KEY'), 'HS256'));
        $idUsuario = filter_var($decoded->id ?? null, FILTER_VALIDATE_INT);

        if ($idUsuario === false || $idUsuario <= 0) {
            throw new InvalidArgumentException("La sesion no es valida");
        }

        return $idUsuario;
    }

    /** Devuelve errores de entrada con estado 422. */
    private function responderValidacion(InvalidArgumentException $e)
    {
        (new Response())->status(422)->toJSON([
            'error' => $e->getMessage(),
        ]);
    }
}
