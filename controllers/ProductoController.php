<?php

class producto
{
    /** Devuelve todos los productos activos en formato JSON. */
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

    /** Devuelve el detalle del producto solicitado. */
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
