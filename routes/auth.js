const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const csrf = require('csurf');

// Middleware de CSRF
const csrfProtection = csrf();

// Rutas de autenticación
router.get('/csrf-token', csrfProtection, authController.getCsrfToken);
router.post('/login', csrfProtection, authController.login);
router.post('/registro', csrfProtection, authController.registro);
router.post('/cerrar-sesion', csrfProtection, authController.cerrarSesion);

module.exports = router;