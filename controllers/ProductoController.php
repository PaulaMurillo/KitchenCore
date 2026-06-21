<?php

class producto
{
    public function index()
    {
        try {
            $response = new Response();
            $productoM = new ProductoModel();
            $result = $productoM->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function get($id)
    {
        try {
            $response = new Response();
            $productoM = new ProductoModel();
            $result = $productoM->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}