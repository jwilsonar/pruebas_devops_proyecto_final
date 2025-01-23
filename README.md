# Documentación del Proyecto

Este proyecto es una **aplicación web de tienda en línea** utilizando **Node.js**, **Express**, y **MongoDB**. Permite la gestión de productos, la autenticación de usuarios, y el manejo de imágenes cargadas por los usuarios.

## Dependencias

El proyecto utiliza las siguientes dependencias:
- `express`: Framework para crear la aplicación web.
- `path`: Módulo de Node.js para manejar rutas de archivos.
- `express-session`: Middleware para gestionar sesiones de usuario.
- `body-parser`: Middleware para analizar los datos del cuerpo de las solicitudes HTTP.
- `mongoose`: ODM para interactuar con MongoDB.
- `connect-flash`: Middleware para mostrar mensajes de flash.
- `multer`: Middleware para manejar la carga de archivos (imágenes).

## Pruebas

Para ejecutar las pruebas de integración, utiliza el siguiente comando:

```bash
npm test
```
```bash
npm run test:integration
```
```bash
npm run test:performance
```
```bash
npm run test:load
```

## Dependencias de pruebas

- `supertest`: Middleware para realizar pruebas de integración.
- `jest`: Framework para pruebas unitarias.
- `express-session`: Middleware para manejar sesiones en pruebas de integración.
- `dotenv`: Middleware para manejar variables de entorno.
- `bcryptjs`: Middleware para encriptar contraseñas.
- `mongoose`: ODM para interactuar con MongoDB.
- `artillery`: Middleware para realizar pruebas de carga.
- `csrf`: Middleware para manejar tokens CSRF.

## Configuración

### Conexión a MongoDB

La aplicación se conecta a MongoDB utilizando `mongoose` y una URI de MongoDB Atlas:

```js
const MONGODB_URI = "mongodb+srv://a20200308:secreto@cluster0.4bkjl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
