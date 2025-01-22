const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Rutas de autenticación
router.post('/login', authController.login);
router.post('/registro', authController.registro);
router.post('/cerrar-sesion', authController.cerrarSesion);

module.exports = router;