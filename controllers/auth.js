const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

exports.login = async (req, res) => {
    try {
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

        req.session.autenticado = true;
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
            usuario: {
                id: usuario._id,
                email: usuario.email,
                tipoUsuario: usuario.tipoUsuario
            }
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al iniciar sesión',
            error: error.message
        });
    }
};

exports.registro = async (req, res) => {
    try {
        console.log('Registro request body:', req.body);
        const { nombres, apellidos, email, password, telefono } = req.body;

        // Validar campos requeridos
        if (!nombres || !apellidos || !email || !password || !telefono) {
            return res.status(422).json({
                mensaje: 'Todos los campos son requeridos'
            });
        }

        // Validar email
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(422).json({
                mensaje: 'Email inválido'
            });
        }

        // Validar teléfono
        const telefonoRegex = /^\d{9}$/;
        const tel = telefono.toString().trim();
        if (!telefonoRegex.test(tel)) {
            return res.status(422).json({
                mensaje: 'El teléfono debe tener 9 dígitos numéricos'
            });
        }

        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(422).json({
                mensaje: 'El email ya está registrado'
            });
        }

        // Validar contraseña
        if (password.length < 4) {
            return res.status(422).json({
                mensaje: 'La contraseña debe tener al menos 4 caracteres'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const usuario = new Usuario({
            nombres,
            apellidos,
            email,
            password: hashedPassword,
            telefono: tel,
            tipoUsuario: 'user',
            carrito: { items: [] }
        });

        const usuarioGuardado = await usuario.save();

        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            usuario: {
                id: usuarioGuardado._id,
                email: usuarioGuardado.email
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        if (error.code === 11000) {
            return res.status(422).json({
                mensaje: 'El email ya está registrado'
            });
        }
        res.status(500).json({
            mensaje: 'Error al crear usuario',
            error: error.message
        });
    }
};

exports.cerrarSesion = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({
                mensaje: 'Error al cerrar sesión',
                error: err.message
            });
        }
        res.status(200).json({
            mensaje: 'Sesión cerrada exitosamente'
        });
    });
};