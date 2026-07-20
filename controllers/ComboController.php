<?php

class combo
{
    /** Devuelve todos los combos activos en formato JSON. */
    public function index()
    {
        try {
            $response = new Response();
            $comboM = new ComboModel();
            $response->toJSON($comboM->all());
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Resuelve catalogos, mantenimiento o detalle numerico. */
    public function get($id)
    {
        try {
            $response = new Response();
            $comboM = new ComboModel();

            if ($id === "mantenimiento") {
                $result = $comboM->allMantenimiento();
            } elseif ($id === "productos") {
                $result = $comboM->getProductos();
            } elseif (ctype_digit((string) $id)) {
                $result = $comboM->get($id);

                if ($result === null) {
                    $response->status(404)->toJSON(['error' => 'Combo no encontrado']);
                    return;
                }
            } else {
                $response->status(400)->toJSON(['error' => 'Solicitud de combo no valida']);
                return;
            }

            $response->toJSON($result);
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Crea un combo. */
    public function create()
    {
        try {
            $request = new Request();
            $comboM = new ComboModel();
            (new Response())->status(201)->toJSON($comboM->create($request->getJSON()));
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Actualiza un combo. */
    public function update($id)
    {
        try {
            $request = new Request();
            $comboM = new ComboModel();
            (new Response())->toJSON($comboM->update($id, $request->getJSON()));
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Desactiva un combo. */
    public function delete($id)
    {
        try {
            $comboM = new ComboModel();
            (new Response())->toJSON($comboM->delete($id));
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Reactiva un combo. */
    public function activar($id)
    {
        try {
            $comboM = new ComboModel();
            (new Response())->toJSON($comboM->activar($id));
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
