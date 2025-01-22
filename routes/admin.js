const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is_auth');

router.get('/productos', isAuth, adminController.getProductos);
router.post('/crear-producto', isAuth, adminController.postCrearProducto);
router.get('/producto/:slug', isAuth, adminController.getDetalleProducto);

module.exports = router;