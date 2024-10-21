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

module.exports = router;