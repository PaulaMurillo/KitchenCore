<?php

class proceso
{
    public function index()
    {
        try {
            $response = new Response();
            $procesoM = new ProcesoPreparacionModel();
            $result = $procesoM->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function get($id)
    {
        try {
            $response = new Response();
            $procesoM = new ProcesoPreparacionModel();
            $result = $procesoM->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}