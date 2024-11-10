module.exports = (req, res, next)=>{
    if(!req.session.autenticado || res.session.tipoUsuario !== 'admin' ){
        return res.redirect('/ingresar');
    }
    next();
}