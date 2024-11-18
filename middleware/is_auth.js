module.exports = (req, res, next)=>{
    if(!req.session.autenticado){
        return res.redirect('/login');
    }else{
        if(req.session.tipoUsuario !== 'admin') return res.redirect('/login')
    }
    next();
}