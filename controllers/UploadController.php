<?php

class upload
{
    private const MAX_IMAGE_SIZE = 5242880;

    /** Recibe una imagen y la publica en la carpeta uploads del frontend. */
    public function image()
    {
        $response = new Response();
        $request = new Request();
        $body = $request->getBody();
        $archivo = $body["imagen"] ?? $body["image"] ?? null;

        if (!$archivo || !isset($archivo["tmp_name"])) {
            $response->status(400)->toJSON(["error" => "Seleccione una imagen para cargar"]);
            return;
        }

        if (($archivo["error"] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            $response->status(400)->toJSON(["error" => "No se pudo recibir la imagen"]);
            return;
        }

        if (($archivo["size"] ?? 0) > self::MAX_IMAGE_SIZE) {
            $response->status(400)->toJSON(["error" => "La imagen no debe superar 5 MB"]);
            return;
        }

        $mime = mime_content_type($archivo["tmp_name"]);
        $extensionesPermitidas = [
            "image/jpeg" => "jpg",
            "image/png" => "png",
            "image/webp" => "webp",
            "image/gif" => "gif",
        ];

        if (!isset($extensionesPermitidas[$mime])) {
            $response->status(400)->toJSON(["error" => "Solo se permiten imagenes JPG, PNG, WebP o GIF"]);
            return;
        }

        $tipo = $this->normalizarPrefijo($body["tipo"] ?? "imagen");
        $nombreArchivo = $tipo . "-" . uniqid("", true) . "." . $extensionesPermitidas[$mime];
        $carpetaUploads = dirname(__DIR__) . DIRECTORY_SEPARATOR . "appKitchenCore" . DIRECTORY_SEPARATOR . "public" . DIRECTORY_SEPARATOR . "uploads";

        if (!is_dir($carpetaUploads) && !mkdir($carpetaUploads, 0775, true)) {
            $response->status(500)->toJSON(["error" => "No se pudo preparar la carpeta de imagenes"]);
            return;
        }

        $destino = $carpetaUploads . DIRECTORY_SEPARATOR . $nombreArchivo;

        if (!move_uploaded_file($archivo["tmp_name"], $destino)) {
            $response->status(500)->toJSON(["error" => "No se pudo guardar la imagen"]);
            return;
        }

        $response->status(201)->toJSON([
            "imagen_url" => "uploads/" . $nombreArchivo,
            "nombre_archivo" => $nombreArchivo,
        ]);
    }

    private function normalizarPrefijo($valor)
    {
        $prefijo = strtolower((string) $valor);
        $prefijo = preg_replace("/[^a-z0-9-]+/", "-", $prefijo);
        $prefijo = trim($prefijo, "-");

        return $prefijo !== "" ? $prefijo : "imagen";
    }
}
