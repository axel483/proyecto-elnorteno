-- ============================================================
-- BASE DE DATOS: bd_elnorteno (Versión Multi-Empresa)
-- SISTEMA DE GESTIÓN E INVENTARIO "COMERCIAL EL NORTEÑO"
-- ============================================================

DROP DATABASE IF EXISTS bd_elnorteno;
CREATE DATABASE bd_elnorteno CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bd_elnorteno;

-- ------------------------------------------------------------
-- 1. TABLAS BASE
-- ------------------------------------------------------------
CREATE TABLE `empresas` (
  `id_empresa` int NOT NULL AUTO_INCREMENT,
  `ruc` varchar(11) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_comercial` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo_url` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color_primario` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT '#059669',
  `direccion` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_admin` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_inicio` date DEFAULT (curdate()),
  `fecha_vencimiento` date DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `monto_mensual` decimal(10,2) DEFAULT '150.00',
  `ultimo_pago` date DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_empresa`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `ruc` (`ruc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre_rol` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `categorias` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_empresa` int DEFAULT '1',
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cajas` (
  `id_caja` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'CERRADA',
  PRIMARY KEY (`id_caja`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `id_rol` int NOT NULL,
  `nombre_usuario` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombres` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `nombre_completo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rol` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_empresa` int DEFAULT '1',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  KEY `fk_usuarios_roles` (`id_rol`),
  KEY `fk_usuario_empresa` (`id_empresa`),
  CONSTRAINT `fk_usuario_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id_empresa`),
  CONSTRAINT `fk_usuarios_roles` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `clientes` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `tipo_documento` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_documento` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre_razon_social` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `num_documento` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_empresa` int DEFAULT '1',
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `numero_documento` (`numero_documento`),
  UNIQUE KEY `UK768i9rw76v13wtuo2ispm8nvc` (`num_documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `proveedores` (
  `id_proveedor` int NOT NULL AUTO_INCREMENT,
  `ruc` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL,
  `razon_social` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_empresa` int DEFAULT '1',
  PRIMARY KEY (`id_proveedor`),
  UNIQUE KEY `ruc` (`ruc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `productos` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `id_categoria` int NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `stock_minimo` int DEFAULT '5',
  `estado` tinyint(1) DEFAULT '1',
  `codigo_barras` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `precio_compra` decimal(10,2) DEFAULT NULL,
  `stock` int NOT NULL,
  `id_empresa` int DEFAULT '1',
  PRIMARY KEY (`id_producto`),
  UNIQUE KEY `UKb2vi4382tjm9b8q2sgfiox2ec` (`codigo_barras`),
  KEY `fk_productos_categorias` (`id_categoria`),
  KEY `fk_producto_empresa` (`id_empresa`),
  CONSTRAINT `fk_producto_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id_empresa`),
  CONSTRAINT `fk_productos_categorias` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `presentaciones_producto` (
  `id_presentacion` int NOT NULL AUTO_INCREMENT,
  `id_producto` int NOT NULL,
  `nombre_presentacion` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `factor_conversion` int NOT NULL DEFAULT '1',
  `precio_venta` decimal(10,2) NOT NULL,
  `id_empresa` int DEFAULT '1',
  PRIMARY KEY (`id_presentacion`),
  KEY `fk_presentaciones_productos` (`id_producto`),
  CONSTRAINT `fk_presentaciones_productos` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sesiones_caja` (
  `id_sesion` int NOT NULL AUTO_INCREMENT,
  `id_caja` int NOT NULL,
  `id_usuario` int NOT NULL,
  `monto_inicial` decimal(10,2) NOT NULL,
  `monto_final` decimal(10,2) DEFAULT NULL,
  `monto_efectivo` decimal(10,2) DEFAULT '0.00',
  `monto_yape` decimal(10,2) DEFAULT '0.00',
  `fecha_apertura` datetime NOT NULL,
  `fecha_cierre` datetime DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'ABIERTA',
  `id_empresa` int DEFAULT '1',
  PRIMARY KEY (`id_sesion`),
  KEY `fk_sesiones_cajas` (`id_caja`),
  KEY `fk_sesiones_usuarios` (`id_usuario`),
  CONSTRAINT `fk_sesiones_cajas` FOREIGN KEY (`id_caja`) REFERENCES `cajas` (`id_caja`),
  CONSTRAINT `fk_sesiones_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ventas` (
  `id_venta` int NOT NULL AUTO_INCREMENT,
  `id_sesion` int NOT NULL,
  `id_cliente` int NOT NULL,
  `id_usuario` int NOT NULL,
  `fecha_venta` datetime DEFAULT CURRENT_TIMESTAMP,
  `metodo_pago` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto_total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `num_comprobante` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_comprobante` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `fecha_hora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_empresa` int DEFAULT '1',
  PRIMARY KEY (`id_venta`),
  KEY `fk_ventas_sesiones` (`id_sesion`),
  KEY `fk_ventas_clientes` (`id_cliente`),
  KEY `fk_ventas_usuarios` (`id_usuario`),
  KEY `fk_venta_empresa` (`id_empresa`),
  CONSTRAINT `fk_venta_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresas` (`id_empresa`),
  CONSTRAINT `fk_ventas_clientes` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `fk_ventas_sesiones` FOREIGN KEY (`id_sesion`) REFERENCES `sesiones_caja` (`id_sesion`),
  CONSTRAINT `fk_ventas_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `detalle_ventas` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_venta` int NOT NULL,
  `id_presentacion` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_aplicado` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `id_producto` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_detalle`),
  KEY `fk_detalle_ventas` (`id_venta`),
  KEY `fk_detalle_presentaciones` (`id_presentacion`),
  KEY `FK7n95cag4p1jy8dajap81mg56a` (`id_producto`),
  CONSTRAINT `FK7n95cag4p1jy8dajap81mg56a` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`),
  CONSTRAINT `fk_detalle_presentaciones` FOREIGN KEY (`id_presentacion`) REFERENCES `presentaciones_producto` (`id_presentacion`),
  CONSTRAINT `fk_detalle_ventas` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `comprobantes` (
  `id_comprobante` int NOT NULL AUTO_INCREMENT,
  `id_venta` int NOT NULL,
  `tipo_comprobante` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `serie` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_sunat` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'NO_ENVIADO',
  `formato_impresion` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_emision` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_comprobante`),
  UNIQUE KEY `id_venta` (`id_venta`),
  CONSTRAINT `fk_comprobantes_ventas` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ingresos_almacen` (
  `id_ingreso` int NOT NULL AUTO_INCREMENT,
  `id_proveedor` int NOT NULL,
  `id_presentacion` int NOT NULL,
  `cantidad` int NOT NULL,
  `costo_unitario` decimal(10,2) NOT NULL,
  `fecha_ingreso` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_ingreso`),
  KEY `fk_ingresos_proveedores` (`id_proveedor`),
  KEY `fk_ingresos_presentaciones` (`id_presentacion`),
  CONSTRAINT `fk_ingresos_presentaciones` FOREIGN KEY (`id_presentacion`) REFERENCES `presentaciones_producto` (`id_presentacion`),
  CONSTRAINT `fk_ingresos_proveedores` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. DATOS SEMILLA (Para poder loguearse y probar)
-- ------------------------------------------------------------

-- Empresa por defecto
INSERT INTO `empresas` (`id_empresa`, `ruc`, `razon_social`, `nombre_comercial`, `slug`, `estado`) VALUES
(1, '20123456789', 'Comercial El Norteño S.A.C.', 'Comercial El Norteño', 'elnorteno', 'ACTIVO');

-- Roles
INSERT INTO `roles` (`id_rol`, `nombre`, `descripcion`, `nombre_rol`) VALUES
(1, 'ADMIN', 'Administrador del sistema', 'ADMIN'),
(2, 'CAJERO', 'Usuario de caja y ventas', 'CAJERO'),
(3, 'ALMACENERO', 'Encargado de inventario', 'ALMACENERO');

-- Usuarios (Contraseña: 123456)
INSERT INTO `usuarios` (`id_rol`, `nombre_usuario`, `password`, `nombres`, `apellidos`, `nombre_completo`, `rol`, `username`, `estado`, `id_empresa`) VALUES
(1, 'admin', '$2a$10$XURP2r6u/9LcHpVQXJ/1Z.GZwqx5h9D9WqPZVYQOwPBYvwHcQ1Xzu', 'Administrador', 'Sistema', 'Administrador Sistema', 'ADMIN', 'admin', 1, 1);

-- Caja Principal
INSERT INTO `cajas` (`id_caja`, `nombre`, `estado`) VALUES (1, 'Caja Principal', 'CERRADA');

-- Cliente genérico
INSERT INTO `clientes` (`id_cliente`, `tipo_documento`, `numero_documento`, `nombre_razon_social`, `id_empresa`) VALUES
(1, 'DNI', '00000000', 'PÚBLICO EN GENERAL', 1);

-- Categorías
INSERT INTO `categorias` (`id_categoria`, `nombre`, `descripcion`, `id_empresa`) VALUES
(1, 'Cervezas', 'Cervezas nacionales e importadas', 1),
(2, 'Gaseosas', 'Bebidas gaseosas y refrescos', 1);

-- Producto de prueba
INSERT INTO `productos` (`id_producto`, `id_categoria`, `nombre`, `stock`, `id_empresa`) VALUES
(1, 1, 'Cerveza Cristal 630ml', 240, 1);

-- Presentación de prueba
INSERT INTO `presentaciones_producto` (`id_presentacion`, `id_producto`, `nombre_presentacion`, `factor_conversion`, `precio_venta`, `id_empresa`) VALUES
(1, 1, 'Unidad', 1, 7.00, 1),
(2, 1, 'Caja x 12', 12, 72.00, 1);