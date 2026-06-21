<?php

class menu
{
    /** Devuelve todos los menús en formato JSON. */
    public function index()
    {
        try {
            $response = new Response();
            $menuM = new MenuModel();
            $result = $menuM->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /** Devuelve el menú identificado por el parámetro recibido. */
    public function get($id)
    {
        try {
            $response = new Response();
            $menuM = new MenuModel();
            $result = $menuM->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /** Devuelve el menú disponible para la fecha y hora actuales. */
    public function disponible()
    {
        try {
            $response = new Response();
            $menuM = new MenuModel();
            $result = $menuM->disponible();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
