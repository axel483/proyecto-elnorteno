# 🍺 Comercial El Norteño - Sistema de Gestión e Inventario (Multi-Empresa)

Sistema POS para gestión de ventas, inventario, caja y comprobantes, desarrollado con **Spring Boot** y **React (Vite)**, con soporte para múltiples empresas.

---

## 📋 Requisitos

- **Java 17** o superior
- **MySQL 8.0** o superior
- **Node.js 18** o superior (npm)

---

## 🚀 Instalación y ejecución

### 1️⃣ Crear la base de datos
- Abre MySQL Workbench o línea de comandos.
- Ejecuta el script `database/bd_elnorteno.sql`.
- Esto creará la base de datos `bd_elnorteno` con las tablas actualizadas y el soporte multi-empresa.

### 2️⃣ Backend (Spring Boot)
- Abre la carpeta `elnorteno-backend` en IntelliJ, Eclipse o VS Code.
- Asegúrate de que `application.properties` tenga la configuración correcta de tu MySQL.
- Ejecuta `mvn clean install` y luego `mvn spring-boot:run`.
- El backend estará en `http://localhost:8080`.

### 3️⃣ Frontend (React + Vite)
- Abre una terminal en la carpeta `elnorteno-frontend`.
- Ejecuta `npm install` para instalar dependencias.
- Ejecuta `npm run dev` para levantar el servidor.
- El frontend estará en `http://localhost:5173`.

### 4️⃣ Acceso al sistema
- Usuario: `admin`
- Contraseña: `123456`

---

## 📂 Estructura del proyecto

- `elnorteno-backend/` - Código Spring Boot (Java)
- `elnorteno-frontend/` - Código React (JavaScript)
- `database/` - Script SQL de la base de datos actualizado

---

## 👨‍💻 Tecnologías utilizadas

- **Backend**: Spring Boot, JPA/Hibernate, MySQL, Lombok, Maven
- **Frontend**: React, Vite, Tailwind CSS, Axios
- **Seguridad**: BCrypt para contraseñas, CORS configurado

---

## 📌 Características principales

- **Arquitectura Multi-Empresa** (SaaS): Separación de datos por empresa.
- Gestión de inventario con múltiples presentaciones por producto.
- POS (Punto de Venta) con selección de presentaciones.
- Control de caja con apertura/cierre y arqueo.
- Historial de ventas con filtros y reimpresión de comprobantes.
- Gestión de clientes (con correo) y proveedores.
- Integración con RENIEC/SUNAT para autocompletar documentos.