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
- `connect-mongodb-session`: Almacenamiento de sesiones en MongoDB.

## Configuración

### Conexión a MongoDB

La aplicación se conecta a MongoDB utilizando `mongoose` y una URI de MongoDB Atlas:

```js
const MONGODB_URI = "mongodb+srv://a20200308:secreto@cluster0.4bkjl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
