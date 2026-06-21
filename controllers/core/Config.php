<?php 
class Config
{
    private static $config;

    /** Obtiene un valor de configuración o devuelve el valor predeterminado. */
    public static function get($key, $default = null)
    {
        if (is_null(self::$config)) {
            self::$config = require_once(realpath(dirname(__FILE__) . '/..') .'../../config.php');
        }

        return !empty(self::$config[$key]) ? self::$config[$key] : $default;
    }
}
