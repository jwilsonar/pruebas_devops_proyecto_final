const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs')

const { validationResult } = require('express-validator');

exports.getLogin=(req, res, next)=>{
    let mensaje = req.flash('error');
    console.log(mensaje)
    if(mensaje.length>0) mensaje=mensaje[0];
    else mensaje = null;

    if(req.session.autenticado){
        if(req.session.tipoUsuario==='admin') res.redirect('/admin/')
        else if (req.session.tipoUsuario==='user') res.redirect('/')
    }
    console.log(req.erroresValidacion)
    res.render('auth/login', {
        path: '/login',
        titulo: 'Inicio de sesión',
        autenticado: req.session.autenticado,
        tipoUsuario: req.session.tipoUsuario,
        mensaje: mensaje,
        datosAnteriores: {
            email: '',
            password: ''
        },
        erroresValidacion: []
    });
}
exports.postLogin=(req, res, next)=>{
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    console.log(errors)
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            titulo: 'Iniciar sesion',
            mensaje: errors.array()[0].msg,
            autenticado: req.session.autenticado,
            tipoUsuario: req.session.tipoUsuario,
            datosAnteriores: {
                email: email,
                password: password
            },
            erroresValidacion: errors.array()
        });
    }

    Usuario.findOne({ email: email })
    .then(usuario => {
        if (!usuario) {
            return res.status(422).render('auth/login', {
                path: '/login',
                titulo: 'Iniciar sesión',
                mensaje: 'Correo o contraseña incorrectos',
                autenticado: req.session.autenticado,
                tipoUsuario: req.session.tipoUsuario,
                datosAnteriores: {
                    email: email,
                    password: password
                },
                erroresValidacion: []
            });
        }
        bcrypt
            .compare(password, usuario.password)
            .then(hayCoincidencia => {
                if (hayCoincidencia) {
                    req.session.autenticado = true;
                    req.session.tipoUsuario = usuario.tipoUsuario;
                    req.session.usuario=usuario;
                    return req.session.save(err => {
                        console.log(err);
                        if(req.session.tipoUsuario==='admin') res.redirect('/admin/');
                        else res.redirect('/');
                    });
                }
                return res.status(422).render('auth/login', {
                    path: '/login',
                    titulo: 'Iniciar sesión',
                    mensaje: 'Contraseña incorrecta',
                    autenticado: req.session.autenticado,
                    tipoUsuario: req.session.tipoUsuario,
                    datosAnteriores: {
                        email: email,
                        password: ''
                    },
                    erroresValidacion: []
                });
            })
            .catch(err => {
                console.log(err);
                res.redirect('/ingresar');
            });
        })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};
exports.getRegistro=(req, res, next)=>{
    res.render('auth/registro', {
        path:'/registro',
        titulo: 'Registro',
        autenticado: req.session.autenticado,
        tipoUsuario: req.session.tipoUsuario,
        mensaje: '',
        datosAnteriores:{
            nombres:'',
            apellidos: '',
            email: '',
            password:'',
            passwordConfirm:''
        },
        erroresValidacion: []
    });
}
exports.postRegistro=(req, res, next)=>{
    const nombres = req.body.nombres;
    const apellidos = req.body.apellidos;
    const telefono = req.body.telefono;
    const email = req.body.email;
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;
    const tipoUsuario='user';
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render('auth/registro',{
            path:'/registro',
            titulo: 'Registro',
            autenticado: req.session.autenticado,
            tipoUsuario: req.session.tipoUsuario,
            mensaje: errors.array()[0].msg,
            datosAnteriores:{
                nombres:'',
                apellidos: '',
                email: '',
                password:'',
                passwordConfirm:''
            },
            erroresValidacion: errors.array()
        })
    }
    bcrypt.hash(password, 12).then(passwordHashed=>{
        const newUser = new Usuario({
            nombres,
            apellidos,
            tipoUsuario,
            telefono,
            email, 
            password: passwordHashed,
            carrito: {items:[]},
            listaDeseos: {items:[]}
        })
        return newUser.save()
    }).then(err=>{
        console.log(err);
        res.redirect('/login')
    })
}

exports.cerrarSesion=(req, res, next)=>{
    req.session.destroy(err=>{
        console.log(err);
        res.redirect('/');
    })
}
exports.getCrearAdmin=(req,res,next)=>{
    res.render('auth/crear-admin',{
        path: '/crear-admin',
        titulo: 'Registro Administrador',
        autenticado: req.session.autenticado,
        tipoUsuario: req.session.tipoUsuario
    })
}
exports.postCrearAdmin=(req, res, next)=>{
    const nombres = req.body.nombres;
    const apellidos = req.body.apellidos;
    const telefono = req.body.telefono;
    const email = req.body.email;
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;
    const tipoUsuario='user';

    Usuario.findOne({email:email}).then(
        user=>{
            if(user) return res.redirect('/registrarse');
            return bcrpyt.hash(password, 12).then(passwordHashed=>{
                const newUser = new Usuario({
                    nombres,
                    apellidos,
                    tipoUsuario,
                    telefono,
                    email, 
                    password: passwordHashed,
                    carrito: {items:[]},
                    listaDeseos: {items:[]}
                })
                return newUser.save()
            })
        }
    )
    res.redirect('/login')
}