<?php

class preparacion
{
    /** Devuelve el listado de procesos de preparacion. */
    public function index()
    {
        try {
            $response = new Response();
            $preparacionM = new ProcesoPreparacionModel();
            $response->toJSON($preparacionM->all());
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Resuelve catalogos, mantenimiento o detalle por producto. */
    public function get($id)
    {
        try {
            $response = new Response();
            $preparacionM = new ProcesoPreparacionModel();

            if ($id === "mantenimiento") {
                $result = $preparacionM->allMantenimiento();
            } elseif ($id === "productos") {
                $result = $preparacionM->getProductos();
            } elseif ($id === "estaciones") {
                $result = $preparacionM->getEstaciones();
            } elseif (ctype_digit((string) $id)) {
                $result = $preparacionM->get($id);

                if ($result === null) {
                    $response->status(404)->toJSON(['error' => 'Proceso no encontrado']);
                    return;
                }
            } else {
                $response->status(400)->toJSON(['error' => 'Solicitud de proceso no valida']);
                return;
            }

            $response->toJSON($result);
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Crea un proceso de preparacion. */
    public function create()
    {
        try {
            $request = new Request();
            $preparacionM = new ProcesoPreparacionModel();
            (new Response())->status(201)->toJSON($preparacionM->create($request->getJSON()));
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Actualiza un proceso de preparacion. */
    public function update($id)
    {
        try {
            $request = new Request();
            $preparacionM = new ProcesoPreparacionModel();
            (new Response())->toJSON($preparacionM->update($id, $request->getJSON()));
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Devuelve errores de entrada con estado 422. */
    private function responderValidacion(InvalidArgumentException $e)
    {
        (new Response())->status(422)->toJSON(['error' => $e->getMessage()]);
    }
}
