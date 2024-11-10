const Usuario = require('../models/usuario');
const bcrpyt = require('bcryptjs')

exports.getLogin=(req, res, next)=>{
    res.render('auth/login', {
        path: '/login',
        titulo: 'Inicio de sesión',
        autenticado: req.session.autenticado,
        tipoUsuari: req.session.tipoUsuario
    });
}
exports.postLogin=(req, res, next)=>{
    const email = req.body.email;
    const password= req.body.password;

    Usuario.findOne({email:email}).then(
        user =>{
            if(!user) res.redirect('/login');
            bcrpyt.compare(password,user.password).then(coincide=>{
                if(coincide){
                    req.session.autenticado=true;
                    req.session.tipoUsuario=user.tipoUsuario;
                    return req.session.save(
                        err=>{
                            console.log(err);
                            res.redirect('/')
                        }
                    )
                }
                res.redirect('/login')
            })
            
        }
    )
}
exports.getRegistro=(req, res, next)=>{
    res.render('auth/registro', {
        path: '/registro',
        titulo: 'Registro',
        autenticado: req.session.autenticado,
        tipoUsuario: req.session.tipoUsuario
    });
}
exports.postRegistro=(req, res, next)=>{
    const nombres = req.body.nombres;
    const apellidos = req.body.apellidos;
    const telefono = req.body.telefono;
    const email = req.body.email;
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;
    const tipoUsuario='admin';

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