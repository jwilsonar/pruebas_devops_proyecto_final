const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');


const router = express.Router();

router.get('/crear-producto', adminController.getCrearProducto);

// router.get('/productos', adminController.getProductos);

router.post('/crear-producto', adminController.postCrearProducto);

module.exports = router;