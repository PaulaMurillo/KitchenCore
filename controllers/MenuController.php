<?php

class menu
{
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