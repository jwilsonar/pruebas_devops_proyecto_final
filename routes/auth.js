const path = require('path');
const express = require('express');
const Usuario = require('../models/usuario')
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const router = express.Router();

router.get('/login',authController.getLogin)
router.post('/login', 
    [
        body('email')
            .isEmail()
            .withMessage('Por favor ingrese un email valido')
            .normalizeEmail(),
        body(
            'password',
            'Por favor ingrese un password que tenga al menos 4 caractéres, incluidos numero letras y símbolos.'
        )
            .isLength({ min: 4 })
            .trim()
    ]
    ,authController.postLogin)
router.get('/registro', authController.getRegistro)
router.post('/registro',     
    [
        // Validación para nombres: debe ser texto con al menos 1 carácter
        // Validación para correo electrónico
        check('email')
            .isEmail()
            .withMessage('Por favor ingrese un email valido')
            .custom((value) => {
                console.log(value)
                return Usuario.findOne({ email: value }).then(usuarioDoc => {
                    console.log(usuarioDoc)
                    if (usuarioDoc) {
                        return Promise.reject(
                            'El email ingresado ya existe'
                        );
                    }
                });
            })
            .normalizeEmail(),
        body('nombres')
            .isLength({ min: 1 })
            .withMessage('El nombre debe tener al menos 1 carácter.')
            .trim(),

        // Validación para apellidos: debe ser texto con al menos 1 carácter
        body('apellidos')
            .isLength({ min: 1 })
            .withMessage('El apellido debe tener al menos 1 carácter.')
            .trim(),

        // Validación para teléfono: debe ser numérico con exactamente 9 dígitos
        body('telefono')
            .isNumeric()
            .withMessage('El teléfono debe contener solo números.')
            .isLength({ min: 9, max: 9 })
            .withMessage('El teléfono debe tener exactamente 9 dígitos.'),

        
        

        // Validación para contraseña: mínimo 4 caracteres, debe incluir letras, números y caracteres especiales
        body('password')
            .isLength({ min: 4 })
            .withMessage('La contraseña debe tener al menos 4 caracteres.')
            .matches(/[A-Za-z]/)
            .withMessage('La contraseña debe contener al menos una letra.')
            .matches(/[0-9]/)
            .withMessage('La contraseña debe contener al menos un número.')
            .matches(/[\W_]/)
            .withMessage('La contraseña debe contener al menos un carácter especial.')
            .trim(),

        // Validación para confirmar contraseña: debe coincidir con la contraseña
        body('confirmPassword')
            .custom((value, { req }) => {
                if (req.body.passwordconfirm !== req.body.password) {
                    throw new Error('La confirmación de la contraseña no coincide con la contraseña.');
                }
                return true;
            })
    ]
    ,authController.postRegistro)

router.post('/cerrar-sesion', authController.cerrarSesion);
module.exports=router;