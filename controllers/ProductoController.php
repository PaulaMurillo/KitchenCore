<?php

class producto
{
    /** Devuelve todos los productos activos en formato JSON. */
    public function index()
    {
        try {
            $response = new Response();
            $productoM = new ProductoModel();
            $response->toJSON($productoM->all());
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Resuelve catálogos, mantenimiento o el detalle numérico solicitado. */
    public function get($id)
    {
        try {
            $response = new Response();
            $productoM = new ProductoModel();

            if ($id === "mantenimiento") {
                $result = $productoM->allMantenimiento();
            } elseif ($id === "categorias") {
                $result = $productoM->getCategorias();
            } elseif ($id === "ingredientes") {
                $result = $productoM->getIngredientes();
            } elseif ($id === "estaciones") {
                $result = $productoM->getEstaciones();
            } elseif (ctype_digit((string) $id)) {
                $result = $productoM->get($id);

                if ($result === null) {
                    $response->status(404)->toJSON([
                        'error' => 'Producto no encontrado',
                    ]);
                    return;
                }
            } else {
                $response->status(400)->toJSON([
                    'error' => 'Solicitud de producto no válida',
                ]);
                return;
            }

            $response->toJSON($result);
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Crea un producto con sus ingredientes. */
    public function create()
    {
        try {
            $request = new Request();
            $productoM = new ProductoModel();
            $result = $productoM->create($request->getJSON());
            (new Response())->status(201)->toJSON($result);
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Actualiza un producto y reemplaza sus ingredientes. */
    public function update($id)
    {
        try {
            $request = new Request();
            $productoM = new ProductoModel();
            $result = $productoM->update($id, $request->getJSON());
            (new Response())->toJSON($result);
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Realiza la eliminación lógica mediante activo = 0. */
    public function delete($id)
    {
        try {
            $productoM = new ProductoModel();
            (new Response())->toJSON($productoM->delete($id));
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Reactiva un producto desactivado. */
    public function activar($id)
    {
        try {
            $productoM = new ProductoModel();
            (new Response())->toJSON($productoM->activar($id));
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Devuelve errores de entrada con un estado HTTP apropiado. */
    private function responderValidacion(InvalidArgumentException $e)
    {
        (new Response())->status(422)->toJSON([
            'error' => $e->getMessage(),
        ]);
    }
}
