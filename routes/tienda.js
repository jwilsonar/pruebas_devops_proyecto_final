const path = require('path');
const express = require('express');
const tiendaController = require('../controllers/tienda.js');
const router = express.Router();

// GET requiere una coincidencia exacta en la ruta
router.get('/', tiendaController.getIndex);

module.exports = router;