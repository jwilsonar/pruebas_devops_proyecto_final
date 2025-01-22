const express = require('express');
const router = express.Router();
const tiendaController = require('../controllers/tienda');
const isAuth = require('../middleware/is_auth');

router.get('/productos', tiendaController.getProductos);
router.get('/producto/:slug', tiendaController.getProducto);
router.get('/carrito', isAuth, tiendaController.getCarrito);
router.post('/carrito', isAuth, tiendaController.postCarrito);
router.post('/carrito-eliminar-item', isAuth, tiendaController.postEliminarProductoCarrito);
router.get('/categorias', tiendaController.getCategorias);
router.get('/categoria/:slug', tiendaController.getCategoria);

module.exports = router;