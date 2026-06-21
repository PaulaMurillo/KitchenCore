<?php
require_once 'vendor/autoload.php';

/* CORS */
header("Access-Control-Allow-Origin: * ");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header('Content-Type: application/json');

/* Core */
require_once "controllers/core/Config.php";
require_once "controllers/core/HandleException.php";
require_once "controllers/core/Logger.php";
require_once "controllers/core/MySqlConnect.php";
require_once "controllers/core/Request.php";
require_once "controllers/core/Response.php";

/* Middleware */
require_once "middleware/AuthMiddleware.php";

/* Modelos KitchenCore */
require_once "models/RolModel.php";
require_once "models/UserModel.php";
require_once "models/ProductoModel.php";
require_once "models/ComboModel.php";
require_once "models/MenuModel.php";
require_once "models/ProcesoPreparacionModel.php";

/* Controladores KitchenCore */
require_once "controllers/UserController.php";
require_once "controllers/ProductoController.php";
require_once "controllers/ComboController.php";
require_once "controllers/MenuController.php";
require_once "controllers/PreparacionController.php";

/* Enrutador */
require_once "routes/RoutesController.php";

$index = new RoutesController();
$index->index();
