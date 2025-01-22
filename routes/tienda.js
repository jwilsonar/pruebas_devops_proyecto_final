const express = require('express');
const router = express.Router();
const tiendaController = require('../controllers/tienda');
const isAuth = require('../middleware/is_auth');
const { csrfProtection } = require('../middleware/csrf_protection');

// Rutas públicas
router.get('/productos', tiendaController.getProductos);
router.get('/producto/:slug', tiendaController.getProducto);
router.get('/categorias', tiendaController.getCategorias);
router.get('/categoria/:slug', tiendaController.getProductosPorCategoria);

// Rutas protegidas (requieren autenticación)
router.get('/carrito', isAuth, csrfProtection, tiendaController.getCarrito);
router.post('/carrito', isAuth, csrfProtection, tiendaController.postCarrito);
router.post('/carrito-eliminar-item', isAuth, csrfProtection, tiendaController.eliminarDelCarrito);
router.post('/crear-pedido', isAuth, csrfProtection, tiendaController.postPedido);

module.exports = router;