<?php

use Psr\Log\LoggerInterface;
use Psr\Log\LogLevel;
class Logger implements LoggerInterface
{
    private $logpath;
    
    /** Inicializa la ruta donde se almacenarán los registros. */
    public function __construct() {
        $this->logpath=Config::get('LOG_PATH');
    }
    /** Escribe un mensaje con su nivel y fecha en el archivo de registro. */
    public function log($level, $message, array $context = []): void
    {
        // Current date in 1970-12-01 23:59:59 format
        $dateFormatted = (new \DateTime())->format('d-m-Y H:i:s');

        // Build the message with the current date, log level, 
        // and the string from the arguments
        
        $user=preg_replace('/\r\n|\r|\n/', '',shell_exec("echo %username%"));
        $message = sprintf(
            '[%s] [%s] %s: %s%s ',
            $dateFormatted,$user,
            $level,
            $message,
            PHP_EOL // Line break
        );
        $dateF = (new \DateTime())->format('d-m-Y');
        $logfilename = $this->logpath."/log-$dateF.log";
        file_put_contents($logfilename , $message, FILE_APPEND);
        
        
    }
    /** Registra una emergencia del sistema. */
    public function emergency($message, array $context = []): void
    {
        // Use the level from LogLevel class
        $this->log(LogLevel::EMERGENCY, $message, $context);
    }

    /** Registra una alerta que requiere atención inmediata. */
    public function alert($message, array $context = []): void
    {
        $this->log(LogLevel::ALERT, $message, $context);
    }
    /** Registra un fallo crítico de la aplicación. */
    public function critical($message, array $context = []): void
    {
        // Use the level from LogLevel class
        $this->log(LogLevel::CRITICAL, $message, $context);
    }
    /** Registra una situación potencialmente problemática. */
    public function warning($message, array $context = []): void
    {
        // Use the level from LogLevel class
        $this->log(LogLevel::WARNING, $message, $context);
    }
    /** Registra un evento normal que merece atención. */
    public function notice($message, array $context = []): void
    {
        // Use the level from LogLevel class
        $this->log(LogLevel::NOTICE, $message, $context);
    }
    /** Registra información general sobre la ejecución. */
    public function info($message, array $context = []): void
    {
        // Use the level from LogLevel class
        $this->log(LogLevel::INFO, $message, $context);
    }
    /** Registra información útil para depurar la aplicación. */
    public function debug($message, array $context = []): void
    {
        // Use the level from LogLevel class
        $this->log(LogLevel::DEBUG, $message, $context);
    }
    /** Registra un error de ejecución. */
    public function error($message, array $context = []): void
    {
        // Use the level from LogLevel class
        $this->log(LogLevel::ERROR, $message, $context);
    }
}
