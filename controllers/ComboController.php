<?php

class combo
{
    /** Devuelve todos los combos activos en formato JSON. */
    public function index()
    {
        try {
            $response = new Response();
            $comboM = new ComboModel();
            $result = $comboM->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /** Devuelve el detalle del combo solicitado. */
    public function get($id)
    {
        try {
            $response = new Response();
            $comboM = new ComboModel();
            $result = $comboM->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
