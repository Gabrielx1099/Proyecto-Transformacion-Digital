-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-12-2025 a las 04:34:56
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
-- Base de datos: `bd_transformacion`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id_categoria`, `nombre`) VALUES
(1, 'Zapatillas'),
(2, 'Zapatos');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_venta`
--

CREATE TABLE `detalle_venta` (
  `id_detalle` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `id_venta` int(11) DEFAULT NULL,
  `descuento` decimal(10,2) DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_venta`
--

INSERT INTO `detalle_venta` (`id_detalle`, `cantidad`, `id_producto`, `id_venta`, `descuento`, `precio_unitario`, `subtotal`) VALUES
(186, 1, 84, 87, 0.00, 310.89, 310.89),
(187, 1, 85, 87, 0.00, 310.90, 310.90),
(188, 1, 86, 87, 0.00, 210.90, 210.90),
(193, 1, 79, 89, 0.00, 503.20, 503.20),
(194, 1, 82, 89, 0.00, 240.90, 240.90),
(195, 1, 80, 89, 0.00, 339.90, 339.90),
(196, 1, 85, 89, 0.00, 310.90, 310.90),
(201, 3, 82, 94, 0.00, 240.90, 722.70),
(204, 3, 79, 96, 0.00, 503.20, 1509.60),
(205, 1, 80, 96, 0.00, 339.90, 339.90);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `marcas`
--

CREATE TABLE `marcas` (
  `id_marca` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `marcas`
--

INSERT INTO `marcas` (`id_marca`, `nombre`) VALUES
(10, 'Nike'),
(11, 'Puma'),
(12, 'Adidas'),
(13, 'Conters'),
(14, 'Calimod'),
(15, 'Basement');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `id_marca` int(11) DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `precio` decimal(38,2) DEFAULT NULL,
  `stock` int(11) NOT NULL,
  `id_subcategoria` int(11) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `id_categoria`, `id_marca`, `imagen_url`, `nombre`, `precio`, `stock`, `id_subcategoria`, `activo`) VALUES
(78, 1, 10, '/uploads/bf67cbb1-9048-42a9-9c15-f91bca6f5d4a_nike1.jpg', 'Nike Dunk Low Retro SE', 599.90, 10, 23, 1),
(79, 1, 10, '/uploads/92a89a75-58a8-4036-bc48-1b2dd55859af_nike-dunk-low-retro-se-2-blue-denim.jpg', 'NIKE DUNK LOW RETRO SE 2 BLUE DENIM', 503.20, 6, 23, 1),
(80, 1, 10, '/uploads/7f964d04-698f-410c-b7d9-79b6d452a47f_196153748811_1_20240821120000-mrtPeru.webp', 'Nike Air Max INTRLK Lite', 339.90, 8, 23, 1),
(81, 1, 11, '/uploads/f1e456b7-5ebf-4d17-8fe6-c29fcfa8fd91_Zapatillas-Park-Lifestyle-OG.avif', 'Park Lifestyle OG', 215.90, 10, 23, 1),
(82, 1, 11, '/uploads/dbe7fe9a-b21d-417e-8979-5069bf46863c_puma-park-lifestyle.jpg', 'Park Lifestyle OG White SD Putty', 240.90, 6, 24, 1),
(83, 1, 12, '/uploads/4cd27702-3af7-475a-8432-063674527fe2_Adidas.jpeg', 'Runfalcon 5', 260.90, 10, 24, 1),
(84, 2, 14, '/uploads/0027c178-c214-46b5-a0f2-793a3fc5730f_1VFF0040034_1-zapato-de-vestir-de-cuero-con-planta-de-caucho-color-negro.webp', 'Zapato de vestir negro', 310.89, 12, 25, 1),
(85, 2, 15, '/uploads/90b84471-4da0-4727-a9d6-5a387e409e6c_1VFF0040034_1-zapato-de-vestir-de-cuero-con-planta-de-caucho-color-negro.webp', 'Zapato de vestir lucuma', 310.90, 9, 25, 1),
(86, 2, 14, '/uploads/b454bd36-44a5-4349-9833-bf5c10202c03_192841-800-auto.webp', 'Zapato cuero casual', 210.90, 12, 25, 1),
(87, 2, 13, '/uploads/bd948f60-fa43-4596-9fe4-33ebd34ec442_Zapatillacalimod.CRI003.whisky.sdely.peru.webp', 'Zapato CRI003', 250.90, 12, 25, 1),
(88, 2, 14, '/uploads/b397cb12-bd3d-4ff0-ba4e-b00c8de36641_192841-800-auto.webp', 'Vans', 12.20, 12, 25, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id_proveedor` int(11) NOT NULL,
  `nombre_empresa` varchar(255) DEFAULT NULL,
  `nombre_proveedor` varchar(255) DEFAULT NULL,
  `ruc` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `subcategorias`
--

CREATE TABLE `subcategorias` (
  `id_subcategoria` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `id_categoria` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `subcategorias`
--

INSERT INTO `subcategorias` (`id_subcategoria`, `nombre`, `id_categoria`) VALUES
(23, 'Hombre/Casual', 2),
(24, 'Mujer/Casual', 2),
(25, 'Hombre/Formal', 1),
(26, 'Mujer/Formal', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `apellidos` varchar(255) DEFAULT NULL,
  `contraseña` varchar(255) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `fechacreacion` datetime(6) DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `rol` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `contrasena` varchar(255) DEFAULT NULL,
  `verificado` bit(1) NOT NULL,
  `codigo_verificacion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `apellidos`, `contraseña`, `direccion`, `email`, `fechacreacion`, `nombre`, `rol`, `telefono`, `contrasena`, `verificado`, `codigo_verificacion`) VALUES
(20, 'Vicente', NULL, 'Hhha', 'tablabravatienda@gmail.com', '2025-10-17 21:43:15.000000', 'Gabriel', 'cliente', '987467374', '$2a$10$tP5e3CctH2o5LsP44RrGjeYeGg6eQz65aFJzy6a/Q.jevWR4PKU8S', b'1', NULL),
(25, 'Vicente', NULL, 'Hhha', 'jfrt853483@gmail.com', '2025-10-18 09:04:27.000000', 'Gabriel', 'admin', '987467374', '$2a$10$Iiqx.2FLSUE3Z0PMwMk0YerIi86Ytbz3O8MpJb.8mEcq7mea1KdhW', b'1', NULL),
(27, 'Palomino', NULL, 'Jr.huancayo-Santa Rosa-puentw Piedra', 'palominoanthony052@gmail.com', '2025-11-22 09:20:01.000000', 'Anthony', 'admin', '987467374', '$2a$10$8vj1PrcGxMUsO/YJfebeEO4rzwKybiPWIoBv30LE4bJLayDUQ6HFm', b'1', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `id_venta` int(11) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `total` decimal(38,2) DEFAULT NULL,
  `estado` varchar(255) DEFAULT NULL,
  `tipo_comprobante` varchar(255) DEFAULT NULL,
  `metodo_pago` varchar(255) DEFAULT NULL,
  `fecha_venta` timestamp NOT NULL DEFAULT current_timestamp(),
  `direccion_envio` varchar(255) DEFAULT NULL,
  `codigo_postal` varchar(255) DEFAULT NULL,
  `departamento_envio` varchar(255) DEFAULT NULL,
  `direccion_fiscal` varchar(255) DEFAULT NULL,
  `distrito_envio` varchar(255) DEFAULT NULL,
  `documento_cliente` varchar(255) DEFAULT NULL,
  `email_cliente` varchar(255) DEFAULT NULL,
  `envio` decimal(38,2) DEFAULT NULL,
  `fecha` datetime(6) DEFAULT NULL,
  `fecha_cancelacion` datetime(6) DEFAULT NULL,
  `fecha_pago` datetime(6) DEFAULT NULL,
  `impuestos` decimal(38,2) DEFAULT NULL,
  `nombre_cliente` varchar(255) DEFAULT NULL,
  `provincia_envio` varchar(255) DEFAULT NULL,
  `razon_social` varchar(255) DEFAULT NULL,
  `referencia_envio` varchar(255) DEFAULT NULL,
  `ruc` varchar(255) DEFAULT NULL,
  `subtotal` decimal(38,2) DEFAULT NULL,
  `telefono_cliente` varchar(255) DEFAULT NULL,
  `tipo_documento` varchar(255) DEFAULT NULL,
  `transaccion_id` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ventas`
--

INSERT INTO `ventas` (`id_venta`, `id_usuario`, `total`, `estado`, `tipo_comprobante`, `metodo_pago`, `fecha_venta`, `direccion_envio`, `codigo_postal`, `departamento_envio`, `direccion_fiscal`, `distrito_envio`, `documento_cliente`, `email_cliente`, `envio`, `fecha`, `fecha_cancelacion`, `fecha_pago`, `impuestos`, `nombre_cliente`, `provincia_envio`, `razon_social`, `referencia_envio`, `ruc`, `subtotal`, `telefono_cliente`, `tipo_documento`, `transaccion_id`) VALUES
(80, 25, 248.86, 'PAGADA', 'boleta', 'tarjeta', '2025-11-22 00:37:26', 'Hhha', '', 'Lima', NULL, 'Bellavista', '72339278', 'fsdfsdf@gmail.com', 0.00, '2025-11-21 19:37:26.000000', NULL, '2025-11-21 19:37:27.000000', 37.96, 'sdfsdf fsdf', 'Callao', NULL, 'po ahi', NULL, 210.90, '987467374', 'DNI', NULL),
(87, 25, 982.57, 'PAGADA', 'boleta', 'tarjeta', '2025-11-22 01:39:26', 'Hhha', '', 'Lima', NULL, 'Callao', '75489565', 'felixleonxx@gmail.com', 0.00, '2025-11-21 20:39:26.000000', NULL, '2025-11-21 20:39:26.000000', 149.88, 'Gabriel Vicente', 'Callao', NULL, '', NULL, 832.69, '987467371', 'DNI', NULL),
(89, 25, 1645.98, 'PAGADA', 'boleta', 'tarjeta', '2025-11-22 01:58:39', 'Hhha', '', 'Lima', NULL, 'Mi Perú', '72339278', '1@gmail.com', 0.00, '2025-11-21 20:58:39.000000', NULL, '2025-11-21 20:58:39.000000', 251.08, 'Gabriel Vicente', 'Lima', NULL, 'po ahi', NULL, 1394.90, '987467375', 'DNI', NULL),
(94, 27, 852.79, 'PAGADA', 'boleta', 'yape', '2025-11-22 14:23:26', 'Jr.huancayo-Santa Rosa-puentw Piedra', '', 'Lima', NULL, 'Ancón', '72339278', 'Palominoanthony052@gmail.com', 0.00, '2025-11-22 09:23:26.000000', NULL, '2025-11-22 09:23:26.000000', 130.09, 'Angtohny Ramirez', 'Lima', NULL, 'casa', NULL, 722.70, '987467374', 'DNI', NULL),
(96, 20, 2182.41, 'PAGADA', 'boleta', 'tarjeta', '2025-11-27 14:14:16', 'Jr.huancayo-Santa Rosa-puentw Piedra', '', 'Lima', NULL, 'Carabayllo', '72339278', 'gv250204@gmail.com', 0.00, '2025-11-27 09:14:16.000000', NULL, '2025-11-27 09:14:16.000000', 332.91, 'Gabriel Vicente', 'Lima', NULL, '', NULL, 1849.50, '987467374', 'DNI', NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `FKe92fd2auy9ms2pvac9b4n8ttq` (`id_producto`),
  ADD KEY `FKgds50vmwbs8lxoti80iekstyi` (`id_venta`);

--
-- Indices de la tabla `marcas`
--
ALTER TABLE `marcas`
  ADD PRIMARY KEY (`id_marca`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `fk_productos_subcategoria` (`id_subcategoria`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id_proveedor`);

--
-- Indices de la tabla `subcategorias`
--
ALTER TABLE `subcategorias`
  ADD PRIMARY KEY (`id_subcategoria`),
  ADD KEY `id_categoria` (`id_categoria`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UKkfsp0s1tflm1cwlj8idhqsad0` (`email`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id_venta`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=206;

--
-- AUTO_INCREMENT de la tabla `marcas`
--
ALTER TABLE `marcas`
  MODIFY `id_marca` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id_proveedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `subcategorias`
--
ALTER TABLE `subcategorias`
  MODIFY `id_subcategoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id_venta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_venta`
--
ALTER TABLE `detalle_venta`
  ADD CONSTRAINT `FKe92fd2auy9ms2pvac9b4n8ttq` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`),
  ADD CONSTRAINT `FKgds50vmwbs8lxoti80iekstyi` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `fk_productos_subcategoria` FOREIGN KEY (`id_subcategoria`) REFERENCES `subcategorias` (`id_subcategoria`);

--
-- Filtros para la tabla `subcategorias`
--
ALTER TABLE `subcategorias`
  ADD CONSTRAINT `subcategorias_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
