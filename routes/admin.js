const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');


const router = express.Router();

router.get('/crear-producto', adminController.getCrearProducto);

router.get('/productos', adminController.getProductos);

router.post('/crear-producto', adminController.postCrearProducto);

router.get('/editar-producto/:idProducto', adminController.getEditarProducto);

router.post('/editar-producto', adminController.postEditarProducto);

router.post('/eliminar-producto', adminController.postEliminarProducto);

module.exports = router;