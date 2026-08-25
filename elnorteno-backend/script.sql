-- ============================================================
-- BASE DE DATOS: COMERCIAL "EL NORTEÑO"
-- Sistema Web de Gestión de Ventas e Inventario
-- ============================================================

CREATE DATABASE IF NOT EXISTS bd_elnorteno
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE bd_elnorteno;

-- 1. Tabla: ROLES
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
) ENGINE=InnoDB;

-- 2. Tabla: USUARIOS
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuarios_roles FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
) ENGINE=InnoDB;

-- 3. Tabla: CLIENTES
CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    tipo_documento ENUM('DNI', 'RUC', 'VARIOS') DEFAULT 'DNI',
    numero_documento VARCHAR(15) UNIQUE,
    nombre_razon_social VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(200)
) ENGINE=InnoDB;

-- 4. Tabla: PROVEEDORES
CREATE TABLE proveedores (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    ruc VARCHAR(11) NOT NULL UNIQUE,
    razon_social VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion VARCHAR(200)
) ENGINE=InnoDB;

-- 5. Tabla: CATEGORIAS
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
) ENGINE=InnoDB;

-- 6. Tabla: PRODUCTOS
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    stock_minimo INT DEFAULT 5,
    estado BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_productos_categorias FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
) ENGINE=InnoDB;

-- 7. Tabla: PRESENTACIONES_PRODUCTO
CREATE TABLE presentaciones_producto (
    id_presentacion INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    nombre_presentacion VARCHAR(50) NOT NULL,
    factor_conversion INT NOT NULL DEFAULT 1,
    precio_venta DECIMAL(10,2) NOT NULL,
    stock_fisico INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_presentaciones_productos FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
) ENGINE=InnoDB;

-- 8. Tabla: CAJAS
CREATE TABLE cajas (
    id_caja INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    estado VARCHAR(20) DEFAULT 'CERRADA'
) ENGINE=InnoDB;

-- 9. Tabla: SESIONES_CAJA
CREATE TABLE sesiones_caja (
    id_sesion INT AUTO_INCREMENT PRIMARY KEY,
    id_caja INT NOT NULL,
    id_usuario INT NOT NULL,
    monto_inicial DECIMAL(10,2) NOT NULL,
    monto_final DECIMAL(10,2),
    monto_efectivo DECIMAL(10,2) DEFAULT 0.00,
    monto_yape DECIMAL(10,2) DEFAULT 0.00,
    fecha_apertura DATETIME NOT NULL,
    fecha_cierre DATETIME,
    estado VARCHAR(20) DEFAULT 'ABIERTA',
    CONSTRAINT fk_sesiones_cajas FOREIGN KEY (id_caja) REFERENCES cajas(id_caja),
    CONSTRAINT fk_sesiones_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- 10. Tabla: VENTAS
CREATE TABLE ventas (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_sesion INT NOT NULL,
    id_cliente INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
    metodo_pago ENUM('EFECTIVO', 'YAPE', 'MIXTO') NOT NULL,
    monto_total DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_ventas_sesiones FOREIGN KEY (id_sesion) REFERENCES sesiones_caja(id_sesion),
    CONSTRAINT fk_ventas_clientes FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    CONSTRAINT fk_ventas_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- 11. Tabla: DETALLE_VENTAS
CREATE TABLE detalle_ventas (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_presentacion INT NOT NULL,
    cantidad INT NOT NULL,
    precio_aplicado DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_detalle_ventas FOREIGN KEY (id_venta) REFERENCES ventas(id_venta),
    CONSTRAINT fk_detalle_presentaciones FOREIGN KEY (id_presentacion) REFERENCES presentaciones_producto(id_presentacion)
) ENGINE=InnoDB;

-- 12. Tabla: COMPROBANTES
CREATE TABLE comprobantes (
    id_comprobante INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL UNIQUE,
    tipo_comprobante ENUM('COTIZACION', 'NOTA_VENTA', 'BOLETA') NOT NULL,
    serie VARCHAR(10),
    numero VARCHAR(20),
    estado_sunat VARCHAR(50) DEFAULT 'NO_ENVIADO',
    formato_impresion ENUM('TICKET_80MM', 'A4') DEFAULT 'TICKET_80MM',
    fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comprobantes_ventas FOREIGN KEY (id_venta) REFERENCES ventas(id_venta)
) ENGINE=InnoDB;

-- 13. Tabla: INGRESOS_ALMACEN
CREATE TABLE ingresos_almacen (
    id_ingreso INT AUTO_INCREMENT PRIMARY KEY,
    id_proveedor INT NOT NULL,
    id_presentacion INT NOT NULL,
    cantidad INT NOT NULL,
    costo_unitario DECIMAL(10,2) NOT NULL,
    fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ingresos_proveedores FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor),
    CONSTRAINT fk_ingresos_presentaciones FOREIGN KEY (id_presentacion) REFERENCES presentaciones_producto(id_presentacion)
) ENGINE=InnoDB;

-- ============================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- ============================================================

-- Insertar Roles
INSERT INTO roles (nombre, descripcion) VALUES
('ADMINISTRADOR', 'Acceso total al sistema'),
('VENDEDOR', 'Acceso operativo al mostrador');

-- Insertar Usuario Semilla (Contraseña: 123456)
INSERT INTO usuarios (id_rol, nombre_usuario, password, nombres, apellidos) VALUES
(1, 'admin', '123456', 'Geferson', 'Contreras'),
(2, 'cajero1', '123456', 'Axel', 'Sacha');

-- Insertar Cliente Genérico
INSERT INTO clientes (tipo_documento, numero_documento, nombre_razon_social) VALUES
('VARIOS', '00000000', 'CLIENTES VARIOS');

-- Insertar Caja Principal
INSERT INTO cajas (nombre, estado) VALUES
('Caja Mostrador 01', 'CERRADA');

-- Insertar Categorías
INSERT INTO categorias (nombre, descripcion) VALUES
('Licores y Destilados', 'Caña pura, licores preparados y espirituosas'),
('Cervezas', 'Cervezas en botella, latas y sixpacks'),
('Gaseosas y Bebidas', 'Gaseosas, energizantes y aguas'),
('Abarrotes y Varios', 'Artículos complementarios y de alta rotación');

-- Insertar Productos de ejemplo
INSERT INTO productos (id_categoria, nombre, descripcion, stock_minimo, estado) VALUES
(1, 'Caña Pura Tradicional 1L', 'Caña pura de alta graduación', 10, TRUE),
(1, 'Caña Pulkay 750ml', 'Caña Pulkay embotellada', 12, TRUE),
(2, 'Cerveza Pilsen Callao 630ml', 'Cerveza personal en botella', 24, TRUE);

-- Insertar Presentaciones
INSERT INTO presentaciones_producto (id_producto, nombre_presentacion, factor_conversion, precio_venta, stock_fisico) VALUES
(1, 'Botella 1L', 1, 12.00, 50),
(2, 'Botella 750ml', 1, 15.00, 30),
(3, 'Botella 630ml', 1, 7.50, 120);