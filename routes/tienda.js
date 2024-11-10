const path = require('path');
const express = require('express');
const tiendaController = require('../controllers/tienda.js');
const router = express.Router();

// GET requiere una coincidencia exacta en la ruta
router.get('/', tiendaController.getIndex);
router.get('/productos', tiendaController.getProductos);

router.get('/carrito', tiendaController.getCarrito);

router.post('/carrito', tiendaController.postCarrito);

router.post('/eliminar-producto-carrito', tiendaController.postEliminarProductoCarrito);

//ver categorias
// router.get('/categorias', tiendaController.getCategorias);
// router.get('/categorias/:slug', tiendaController.getCategoria);

// //ver desarrolladores
// router.get('/desarrolladores', tiendaController.getDesarrolladores)
// router.get('/desarrolladores/:slug', tiendaController.getDesarrollador)

// //ver genero
// router.get('/generos', tiendaController.getGeneros)
// router.get('/generos/:slug', tiendaController.getGenero);

// //ver Plataforma
// router.get('/plataformas', tiendaController.getPlataformas)
// router.get('/plataformas/:slug', tiendaController.getPlataforma);

module.exports = router;