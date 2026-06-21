<?php

class preparacion
{
    /** Devuelve el listado de procesos de preparación. */
    public function index()
    {
        try {
            $response = new Response();
            $preparacionM = new ProcesoPreparacionModel();
            $result = $preparacionM->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /** Devuelve el proceso de preparación del producto solicitado. */
    public function get($id)
    {
        try {
            $response = new Response();
            $preparacionM = new ProcesoPreparacionModel();
            $result = $preparacionM->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
