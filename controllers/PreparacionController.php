<?php

class preparacion
{
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
