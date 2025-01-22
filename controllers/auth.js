const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const session = require('express-session');

exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ 
                mensaje: 'Error de validación',
                errores: errors.array() 
            });
        }

        const { email, password } = req.body;
        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.status(422).json({
                mensaje: 'Email o contraseña incorrectos'
            });
        }

        const coincide = await bcrypt.compare(password, usuario.password);
        if (!coincide) {
            return res.status(422).json({
                mensaje: 'Email o contraseña incorrectos'
            });
        }

        req.session.usuario = {
            _id: usuario._id,
            email: usuario.email,
            tipoUsuario: usuario.tipoUsuario
        };

        await new Promise((resolve, reject) => {
            req.session.save(err => {
                if (err) reject(err);
                resolve();
            });
        });

        res.status(200).json({
            mensaje: 'Inicio de sesión exitoso',
            usuario: {
                email: usuario.email,
                tipoUsuario: usuario.tipoUsuario
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            mensaje: 'Error al iniciar sesión',
            error: error.message
        });
    }
};

exports.registro = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                mensaje: 'Error de validación',
                errores: errors.array()
            });
        }

        const { email, password, nombres, apellidos, telefono, tipoUsuario } = req.body;

        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(422).json({
                mensaje: 'El email ya está registrado'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const usuario = new Usuario({
            email,
            password: hashedPassword,
            nombres,
            apellidos,
            telefono,
            tipoUsuario: tipoUsuario || 'cliente',
            carrito: { items: [] }
        });

        await usuario.save();

        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            usuario: {
                email: usuario.email,
                nombres: usuario.nombres,
                tipoUsuario: usuario.tipoUsuario
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            mensaje: 'Error al registrar usuario',
            error: error.message
        });
    }
};

exports.cerrarSesion = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).json({
                mensaje: 'Error al cerrar sesión'
            });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({
            mensaje: 'Sesión cerrada exitosamente'
        });
    });
};

exports.getCsrfToken = (req, res) => {
    try {
        const token = req.csrfToken();
        res.status(200).json({ csrfToken: token });
    } catch (error) {
        console.error('Error al generar token CSRF:', error);
        res.status(500).json({
            mensaje: 'Error al generar token CSRF',
            error: error.message
        });
    }
};