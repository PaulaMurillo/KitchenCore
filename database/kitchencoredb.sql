-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-06-2026 a las 07:32:38
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `kitchencoredb`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `canales_pedido`
--

CREATE TABLE `canales_pedido` (
  `id_canal` int(11) NOT NULL,
  `nombre_canal` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `canales_pedido`
--

INSERT INTO `canales_pedido` (`id_canal`, `nombre_canal`, `descripcion`) VALUES
(1, 'Aplicación Web - Cliente', 'Pedido autogestionado por el cliente desde el menú web.'),
(2, 'Punto de Venta - Empleado', 'Pedido tomado de forma presencial por un encargado.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id_categoria`, `nombre`, `descripcion`) VALUES
(1, 'Hamburguesas', 'Productos principales preparados con pan, carne y acompañamientos.'),
(2, 'Bebidas', 'Bebidas frías para acompañar los pedidos.'),
(3, 'Acompañamientos', 'Complementos como papas, nuggets y otros productos adicionales.'),
(4, 'Combos', 'Combinaciones de productos con precio especial.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `combos`
--

CREATE TABLE `combos` (
  `id_combo` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `precio_especial` decimal(10,2) NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `id_categoria` int(11) NOT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `combos`
--

INSERT INTO `combos` (`id_combo`, `nombre`, `descripcion`, `precio_especial`, `imagen_url`, `id_categoria`, `activo`) VALUES
(1, 'Combo Core Clásico', 'Incluye CoreBurger Clásica, Papas Core y Bebida Gaseosa.', 5900.00, 'uploads/combo-core-clasico.jpg', 4, 1),
(2, 'Combo Bacon Premium', 'Incluye CoreBurger Bacon, Papas Core y Bebida Gaseosa.', 6900.00, 'uploads/combo-bacon-premium.jpg', 4, 1),
(3, 'Combo Nuggets', 'Incluye Nuggets Core y Bebida Gaseosa.', 3400.00, 'uploads/combo-nuggets.jpg', 4, 1),
(4, 'Combo Familiar Core', 'Incluye dos hamburguesas, papas y bebidas para compartir.', 11900.00, 'uploads/combo-familiar-core.jpg', 4, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `combo_productos`
--

CREATE TABLE `combo_productos` (
  `id_combo` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `combo_productos`
--

INSERT INTO `combo_productos` (`id_combo`, `id_producto`, `cantidad`) VALUES
(1, 1, 1),
(1, 3, 1),
(1, 5, 1),
(2, 2, 1),
(2, 3, 1),
(2, 5, 1),
(3, 4, 1),
(3, 5, 1),
(4, 1, 2),
(4, 3, 1),
(4, 5, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_factura`
--

CREATE TABLE `detalle_factura` (
  `id_detalle_factura` int(11) NOT NULL,
  `id_factura` int(11) NOT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `id_combo` int(11) DEFAULT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_historico` decimal(10,2) NOT NULL,
  `impuesto_aplicado` decimal(10,2) NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedido`
--

CREATE TABLE `detalle_pedido` (
  `id_detalle` int(11) NOT NULL,
  `id_pedido` int(11) NOT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `id_combo` int(11) DEFAULT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `precio_unitario` decimal(10,2) NOT NULL,
  `id_estado_item` int(11) NOT NULL,
  `notas` text DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estaciones_cocina`
--

CREATE TABLE `estaciones_cocina` (
  `id_estacion` int(11) NOT NULL,
  `nombre_estacion` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estaciones_cocina`
--

INSERT INTO `estaciones_cocina` (`id_estacion`, `nombre_estacion`, `descripcion`) VALUES
(1, 'Parrilla', 'Estación encargada de cocinar carnes y proteínas.'),
(2, 'Freidora', 'Estación encargada de preparar productos fritos.'),
(3, 'Ensamblaje', 'Estación donde se arma el producto final.'),
(4, 'Empaque', 'Estación donde se empaca el pedido para entrega.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados_pedido`
--

CREATE TABLE `estados_pedido` (
  `id_estado` int(11) NOT NULL,
  `nombre_estado` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estados_pedido`
--

INSERT INTO `estados_pedido` (`id_estado`, `nombre_estado`) VALUES
(2, 'Aceptada'),
(5, 'Entregada'),
(1, 'Pendiente de pago'),
(3, 'Preparación'),
(4, 'Procesando');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturas`
--

CREATE TABLE `facturas` (
  `id_factura` int(11) NOT NULL,
  `numero_factura` varchar(50) NOT NULL,
  `id_pedido` int(11) NOT NULL,
  `id_usuario_cliente` int(11) NOT NULL,
  `id_metodo_pago` int(11) NOT NULL,
  `fecha_emision` datetime NOT NULL DEFAULT current_timestamp(),
  `subtotal` decimal(10,2) NOT NULL,
  `impuestos` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `monto_recibido` decimal(10,2) NOT NULL,
  `vuelto_entregado` decimal(10,2) DEFAULT 0.00,
  `datos_fiscales_cliente` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_preparacion`
--

CREATE TABLE `historial_preparacion` (
  `id_historial` int(11) NOT NULL,
  `id_detalle_pedido` int(11) NOT NULL,
  `id_estado_origen` int(11) NOT NULL,
  `id_estado_destino` int(11) NOT NULL,
  `fecha_hora_cambio` datetime NOT NULL DEFAULT current_timestamp(),
  `id_usuario_encargado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ingredientes`
--

CREATE TABLE `ingredientes` (
  `id_ingrediente` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `unidad_medida` varchar(20) NOT NULL,
  `stock_actual` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock_minimo` decimal(10,2) NOT NULL DEFAULT 0.00,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ingredientes`
--

INSERT INTO `ingredientes` (`id_ingrediente`, `nombre`, `unidad_medida`, `stock_actual`, `stock_minimo`, `activo`) VALUES
(1, 'Pan artesanal', 'unidad', 100.00, 10.00, 1),
(2, 'Carne de res', 'gramos', 5000.00, 500.00, 1),
(3, 'Queso cheddar', 'unidad', 80.00, 10.00, 1),
(4, 'Lechuga', 'gramos', 2000.00, 200.00, 1),
(5, 'Tomate', 'gramos', 2000.00, 200.00, 1),
(6, 'Tocino', 'gramos', 1500.00, 150.00, 1),
(7, 'Papas', 'gramos', 5000.00, 500.00, 1),
(8, 'Pollo', 'gramos', 4000.00, 400.00, 1),
(9, 'Salsa especial', 'ml', 2000.00, 200.00, 1),
(10, 'Bebida gaseosa', 'ml', 8000.00, 800.00, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `menus`
--

CREATE TABLE `menus` (
  `id_menu` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `activo` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `menus`
--

INSERT INTO `menus` (`id_menu`, `nombre`, `fecha_inicio`, `fecha_fin`, `hora_inicio`, `hora_fin`, `activo`) VALUES
(1, 'Menú Diario KitchenCore', '2026-07-01', '2026-07-31', '00:00:00', '23:59:59', 1),
(2, 'Menú Desayuno Core', '2026-06-01', '2026-06-10', '06:00:00', '10:30:00', 0),
(3, 'Menú Almuerzo Ejecutivo', '2026-06-11', '2026-06-20', '11:00:00', '15:00:00', 0),
(4, 'Menú Promocional Fin de Semana', '2026-08-01', '2026-08-15', '12:00:00', '22:00:00', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `menu_items`
--

CREATE TABLE `menu_items` (
  `id_menu_item` int(11) NOT NULL,
  `id_menu` int(11) NOT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `id_combo` int(11) DEFAULT NULL
) ;

--
-- Volcado de datos para la tabla `menu_items`
--

INSERT INTO `menu_items` (`id_menu_item`, `id_menu`, `id_producto`, `id_combo`) VALUES
(1, 1, 5, NULL),
(2, 1, 2, NULL),
(3, 1, 1, NULL),
(4, 1, 4, NULL),
(5, 1, 3, NULL),
(8, 1, NULL, 2),
(9, 1, NULL, 1),
(10, 1, NULL, 4),
(11, 1, NULL, 3),
(15, 2, 5, NULL),
(16, 2, 1, NULL),
(18, 3, 5, NULL),
(19, 3, 2, NULL),
(20, 3, 3, NULL),
(21, 4, NULL, 2),
(22, 4, NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metodos_pago`
--

CREATE TABLE `metodos_pago` (
  `id_metodo` int(11) NOT NULL,
  `nombre_metodo` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `metodos_pago`
--

INSERT INTO `metodos_pago` (`id_metodo`, `nombre_metodo`) VALUES
(3, 'Efectivo'),
(1, 'Tarjeta de Crédito'),
(2, 'Tarjeta de Débito');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id_pedido` int(11) NOT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT current_timestamp(),
  `id_canal` int(11) NOT NULL,
  `id_usuario_cliente` int(11) NOT NULL,
  `id_usuario_empleado` int(11) DEFAULT NULL,
  `cliente_anonimo` tinyint(1) DEFAULT 0,
  `total_pagado` decimal(10,2) NOT NULL DEFAULT 0.00,
  `id_estado` int(11) NOT NULL,
  `direccion_entrega` text DEFAULT NULL,
  `costo_envio` decimal(10,2) DEFAULT 0.00,
  `metodo_entrega` enum('Entrega a domicilio','Recogida en tienda') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `nombre`, `descripcion`, `precio`, `id_categoria`, `imagen_url`, `activo`) VALUES
(1, 'CoreBurger Clasica', 'Hamburguesa clasica con carne de res, queso cheddar, lechuga, tomate y salsa especial.', 3500.00, 1, 'uploads/CoreBurger.jpeg', 1),
(2, 'CoreBurger Bacon', 'Hamburguesa con carne de res, queso cheddar, tocino crujiente y salsa especial.', 4200.00, 1, 'uploads/CoreBurgerBacon.jpeg', 1),
(3, 'Papas Core', 'Papas fritas doradas con sal y salsa especial.', 1800.00, 3, 'uploads/papasCore.jpeg', 1),
(4, 'Nuggets Core', 'Porcion de nuggets de pollo acompanados con salsa especial.', 2500.00, 3, 'uploads/NuggetsCore.jpeg', 1),
(5, 'Bebida Gaseosa', 'Bebida fria para acompanar el pedido.', 1300.00, 2, 'uploads/BebidaGaseosa.jpeg', 1),
(6, 'Core Papitas Bacon', 'Core Papitas Bacon, unas señoras papas con bacon.', 1500.00, 3, 'uploads/papasCore.jpeg', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_ingredientes`
--

CREATE TABLE `producto_ingredientes` (
  `id_producto` int(11) NOT NULL,
  `id_ingrediente` int(11) NOT NULL,
  `cantidad_requerida` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto_ingredientes`
--

INSERT INTO `producto_ingredientes` (`id_producto`, `id_ingrediente`, `cantidad_requerida`) VALUES
(1, 1, 1.00),
(1, 2, 150.00),
(1, 3, 1.00),
(1, 4, 30.00),
(1, 5, 30.00),
(1, 9, 20.00),
(2, 1, 1.00),
(2, 2, 150.00),
(2, 3, 1.00),
(2, 6, 40.00),
(3, 7, 200.00),
(4, 8, 180.00),
(5, 10, 355.00),
(6, 6, 50.00),
(6, 7, 250.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_pasos_cocina`
--

CREATE TABLE `producto_pasos_cocina` (
  `id_producto` int(11) NOT NULL,
  `id_estacion` int(11) NOT NULL,
  `orden_paso` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto_pasos_cocina`
--

INSERT INTO `producto_pasos_cocina` (`id_producto`, `id_estacion`, `orden_paso`) VALUES
(1, 1, 1),
(1, 3, 2),
(1, 4, 3),
(2, 1, 1),
(2, 3, 2),
(2, 4, 3),
(3, 2, 1),
(3, 4, 2),
(4, 2, 1),
(4, 4, 2),
(5, 4, 1),
(6, 2, 1),
(6, 3, 2),
(6, 4, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id_rol` int(11) NOT NULL,
  `nombre_rol` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id_rol`, `nombre_rol`, `descripcion`) VALUES
(1, 'Cliente', 'Usuario final que autogestiona sus pedidos.'),
(2, 'Encargado', 'Personal que gestiona y visualiza todos los pedidos y filtros.'),
(3, 'Cocina', 'Operario que cambia estados en estaciones de preparación en tiempo real.'),
(4, 'Administrador', 'Control total del sistema.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre_completo` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `token_temporal` varchar(100) DEFAULT NULL,
  `token_expiracion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre_completo`, `email`, `password_hash`, `id_rol`, `telefono`, `activo`, `token_temporal`, `token_expiracion`) VALUES
(1, 'Administrador KitchenCore', 'admin@kitchencore.local', '$2y$10$Ipr0zpbrz7dF0mNXfcaXdeIrc9LCYPSz8cLKPiRFNjozhx8jgED0O', 4, NULL, 1, NULL, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `canales_pedido`
--
ALTER TABLE `canales_pedido`
  ADD PRIMARY KEY (`id_canal`),
  ADD UNIQUE KEY `nombre_canal` (`nombre_canal`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `combos`
--
ALTER TABLE `combos`
  ADD PRIMARY KEY (`id_combo`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `id_categoria` (`id_categoria`);

--
-- Indices de la tabla `combo_productos`
--
ALTER TABLE `combo_productos`
  ADD PRIMARY KEY (`id_combo`,`id_producto`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `detalle_factura`
--
ALTER TABLE `detalle_factura`
  ADD PRIMARY KEY (`id_detalle_factura`),
  ADD KEY `id_factura` (`id_factura`),
  ADD KEY `id_producto` (`id_producto`),
  ADD KEY `id_combo` (`id_combo`);

--
-- Indices de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `id_producto` (`id_producto`),
  ADD KEY `id_combo` (`id_combo`),
  ADD KEY `id_estado_item` (`id_estado_item`);

--
-- Indices de la tabla `estaciones_cocina`
--
ALTER TABLE `estaciones_cocina`
  ADD PRIMARY KEY (`id_estacion`),
  ADD UNIQUE KEY `nombre_estacion` (`nombre_estacion`);

--
-- Indices de la tabla `estados_pedido`
--
ALTER TABLE `estados_pedido`
  ADD PRIMARY KEY (`id_estado`),
  ADD UNIQUE KEY `nombre_estado` (`nombre_estado`);

--
-- Indices de la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD PRIMARY KEY (`id_factura`),
  ADD UNIQUE KEY `numero_factura` (`numero_factura`),
  ADD UNIQUE KEY `id_pedido` (`id_pedido`),
  ADD KEY `id_usuario_cliente` (`id_usuario_cliente`),
  ADD KEY `id_metodo_pago` (`id_metodo_pago`);

--
-- Indices de la tabla `historial_preparacion`
--
ALTER TABLE `historial_preparacion`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `id_detalle_pedido` (`id_detalle_pedido`),
  ADD KEY `id_estado_origen` (`id_estado_origen`),
  ADD KEY `id_estado_destino` (`id_estado_destino`),
  ADD KEY `id_usuario_encargado` (`id_usuario_encargado`);

--
-- Indices de la tabla `ingredientes`
--
ALTER TABLE `ingredientes`
  ADD PRIMARY KEY (`id_ingrediente`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id_menu`);

--
-- Indices de la tabla `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`id_menu_item`),
  ADD KEY `id_menu` (`id_menu`),
  ADD KEY `id_producto` (`id_producto`),
  ADD KEY `id_combo` (`id_combo`);

--
-- Indices de la tabla `metodos_pago`
--
ALTER TABLE `metodos_pago`
  ADD PRIMARY KEY (`id_metodo`),
  ADD UNIQUE KEY `nombre_metodo` (`nombre_metodo`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id_pedido`),
  ADD KEY `id_canal` (`id_canal`),
  ADD KEY `id_usuario_cliente` (`id_usuario_cliente`),
  ADD KEY `id_usuario_empleado` (`id_usuario_empleado`),
  ADD KEY `id_estado` (`id_estado`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id_producto`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `id_categoria` (`id_categoria`);

--
-- Indices de la tabla `producto_ingredientes`
--
ALTER TABLE `producto_ingredientes`
  ADD PRIMARY KEY (`id_producto`,`id_ingrediente`),
  ADD KEY `id_ingrediente` (`id_ingrediente`);

--
-- Indices de la tabla `producto_pasos_cocina`
--
ALTER TABLE `producto_pasos_cocina`
  ADD PRIMARY KEY (`id_producto`,`id_estacion`),
  ADD UNIQUE KEY `uq_producto_orden` (`id_producto`,`orden_paso`),
  ADD KEY `id_estacion` (`id_estacion`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`),
  ADD UNIQUE KEY `nombre_rol` (`nombre_rol`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `id_rol` (`id_rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `canales_pedido`
--
ALTER TABLE `canales_pedido`
  MODIFY `id_canal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `combos`
--
ALTER TABLE `combos`
  MODIFY `id_combo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `detalle_factura`
--
ALTER TABLE `detalle_factura`
  MODIFY `id_detalle_factura` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estaciones_cocina`
--
ALTER TABLE `estaciones_cocina`
  MODIFY `id_estacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `estados_pedido`
--
ALTER TABLE `estados_pedido`
  MODIFY `id_estado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `facturas`
--
ALTER TABLE `facturas`
  MODIFY `id_factura` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `historial_preparacion`
--
ALTER TABLE `historial_preparacion`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ingredientes`
--
ALTER TABLE `ingredientes`
  MODIFY `id_ingrediente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `menus`
--
ALTER TABLE `menus`
  MODIFY `id_menu` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `menu_items`
--
ALTER TABLE `menu_items`
  MODIFY `id_menu_item` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `metodos_pago`
--
ALTER TABLE `metodos_pago`
  MODIFY `id_metodo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id_pedido` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `combos`
--
ALTER TABLE `combos`
  ADD CONSTRAINT `combos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`);

--
-- Filtros para la tabla `combo_productos`
--
ALTER TABLE `combo_productos`
  ADD CONSTRAINT `combo_productos_ibfk_1` FOREIGN KEY (`id_combo`) REFERENCES `combos` (`id_combo`) ON DELETE CASCADE,
  ADD CONSTRAINT `combo_productos_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`);

--
-- Filtros para la tabla `detalle_factura`
--
ALTER TABLE `detalle_factura`
  ADD CONSTRAINT `detalle_factura_ibfk_1` FOREIGN KEY (`id_factura`) REFERENCES `facturas` (`id_factura`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_factura_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`),
  ADD CONSTRAINT `detalle_factura_ibfk_3` FOREIGN KEY (`id_combo`) REFERENCES `combos` (`id_combo`);

--
-- Filtros para la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD CONSTRAINT `detalle_pedido_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_pedido_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`),
  ADD CONSTRAINT `detalle_pedido_ibfk_3` FOREIGN KEY (`id_combo`) REFERENCES `combos` (`id_combo`),
  ADD CONSTRAINT `detalle_pedido_ibfk_4` FOREIGN KEY (`id_estado_item`) REFERENCES `estados_pedido` (`id_estado`);

--
-- Filtros para la tabla `facturas`
--
ALTER TABLE `facturas`
  ADD CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`),
  ADD CONSTRAINT `facturas_ibfk_2` FOREIGN KEY (`id_usuario_cliente`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `facturas_ibfk_3` FOREIGN KEY (`id_metodo_pago`) REFERENCES `metodos_pago` (`id_metodo`);

--
-- Filtros para la tabla `historial_preparacion`
--
ALTER TABLE `historial_preparacion`
  ADD CONSTRAINT `historial_preparacion_ibfk_1` FOREIGN KEY (`id_detalle_pedido`) REFERENCES `detalle_pedido` (`id_detalle`) ON DELETE CASCADE,
  ADD CONSTRAINT `historial_preparacion_ibfk_2` FOREIGN KEY (`id_estado_origen`) REFERENCES `estados_pedido` (`id_estado`),
  ADD CONSTRAINT `historial_preparacion_ibfk_3` FOREIGN KEY (`id_estado_destino`) REFERENCES `estados_pedido` (`id_estado`),
  ADD CONSTRAINT `historial_preparacion_ibfk_4` FOREIGN KEY (`id_usuario_encargado`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `menu_items`
--
ALTER TABLE `menu_items`
  ADD CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`id_menu`) REFERENCES `menus` (`id_menu`) ON DELETE CASCADE,
  ADD CONSTRAINT `menu_items_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`),
  ADD CONSTRAINT `menu_items_ibfk_3` FOREIGN KEY (`id_combo`) REFERENCES `combos` (`id_combo`);

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`id_canal`) REFERENCES `canales_pedido` (`id_canal`),
  ADD CONSTRAINT `pedidos_ibfk_2` FOREIGN KEY (`id_usuario_cliente`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `pedidos_ibfk_3` FOREIGN KEY (`id_usuario_empleado`) REFERENCES `usuarios` (`id_usuario`),
  ADD CONSTRAINT `pedidos_ibfk_4` FOREIGN KEY (`id_estado`) REFERENCES `estados_pedido` (`id_estado`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`);

--
-- Filtros para la tabla `producto_ingredientes`
--
ALTER TABLE `producto_ingredientes`
  ADD CONSTRAINT `producto_ingredientes_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE,
  ADD CONSTRAINT `producto_ingredientes_ibfk_2` FOREIGN KEY (`id_ingrediente`) REFERENCES `ingredientes` (`id_ingrediente`) ON DELETE CASCADE;

--
-- Filtros para la tabla `producto_pasos_cocina`
--
ALTER TABLE `producto_pasos_cocina`
  ADD CONSTRAINT `producto_pasos_cocina_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE,
  ADD CONSTRAINT `producto_pasos_cocina_ibfk_2` FOREIGN KEY (`id_estacion`) REFERENCES `estaciones_cocina` (`id_estacion`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
