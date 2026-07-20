<?php

class menu
{
    /** Devuelve todos los menus en formato JSON. */
    public function index()
    {
        try {
            $response = new Response();
            $menuM = new MenuModel();
            $response->toJSON($menuM->all());
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Resuelve catalogos, mantenimiento, disponible o detalle. */
    public function get($id)
    {
        try {
            $response = new Response();
            $menuM = new MenuModel();

            if ($id === "disponible") {
                $result = $menuM->disponible();
            } elseif ($id === "mantenimiento") {
                $result = $menuM->allMantenimiento();
            } elseif ($id === "productos") {
                $result = $menuM->getProductos();
            } elseif ($id === "combos") {
                $result = $menuM->getCombos();
            } elseif (ctype_digit((string) $id)) {
                $result = $menuM->get($id);

                if ($result === null) {
                    $response->status(404)->toJSON(['error' => 'Menu no encontrado']);
                    return;
                }
            } else {
                $response->status(400)->toJSON(['error' => 'Solicitud de menu no valida']);
                return;
            }

            $response->toJSON($result);
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Devuelve el menu disponible para la fecha y hora actuales. */
    public function disponible()
    {
        try {
            $response = new Response();
            $menuM = new MenuModel();
            $response->toJSON($menuM->disponible());
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Crea un menu. */
    public function create()
    {
        try {
            $request = new Request();
            $menuM = new MenuModel();
            (new Response())->status(201)->toJSON($menuM->create($request->getJSON()));
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Actualiza un menu. */
    public function update($id)
    {
        try {
            $request = new Request();
            $menuM = new MenuModel();
            (new Response())->toJSON($menuM->update($id, $request->getJSON()));
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Desactiva un menu. */
    public function delete($id)
    {
        try {
            $menuM = new MenuModel();
            (new Response())->toJSON($menuM->delete($id));
        } catch (InvalidArgumentException $e) {
            $this->responderValidacion($e);
        } catch (Throwable $e) {
            handleException($e);
        }
    }

    /** Reactiva un menu. */
    public function activar($id)
    {
        try {
            $menuM = new MenuModel();
            (new Response())->toJSON($menuM->activar($id));
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
