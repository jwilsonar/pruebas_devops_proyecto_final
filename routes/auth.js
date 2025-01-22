const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth');
const { csrfProtection } = require('../middleware/csrf_protection');
const Usuario = require('../models/usuario');

// Validaciones
const validacionesRegistro = [
    body('email')
        .isEmail()
        .withMessage('Por favor ingrese un email válido')
        .custom(async (value) => {
            const usuario = await Usuario.findOne({ email: value });
            if (usuario) {
                throw new Error('El email ya está registrado');
            }
            return true;
        }),
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/\d/)
        .withMessage('La contraseña debe contener al menos un número'),
    body('nombres').trim().not().isEmpty(),
    body('apellidos').trim().not().isEmpty(),
    body('telefono').trim().not().isEmpty()
];

const validacionesLogin = [
    body('email').isEmail().withMessage('Por favor ingrese un email válido'),
    body('password').not().isEmpty().withMessage('La contraseña es requerida')
];

// Rutas
router.get('/csrf-token', csrfProtection, authController.getCsrfToken);
router.post('/registro', csrfProtection, validacionesRegistro, authController.registro);
router.post('/login', csrfProtection, validacionesLogin, authController.login);
router.post('/cerrar-sesion', csrfProtection, authController.cerrarSesion);

module.exports = router;