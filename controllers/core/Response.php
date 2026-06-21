<?php

class Response
{
    private $status = 200;

    /** Define el código HTTP que utilizará la respuesta. */
    public function status(int $code)
    {
        $this->status = $code;
        return $this;
    }
    
    /** Serializa y envía la respuesta al cliente en formato JSON. */
    public function toJSON($response = [],$message="")
    {
        //Verificar respuesta
        if (isset($response) && !empty($response)) {
            $json = $response;
        } else {
            $this->status =400;
            $json =  $message ?? "No se efectuo la solicitud";
        }
        //Escribir respuesta JSON con código de estado HTTP
        echo json_encode(
            $json,
            http_response_code($this->status)
        );
    }
}
