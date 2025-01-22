module.exports = (req, res, next) => {
    if (!req.session.usuario || req.session.usuario.tipoUsuario !== 'admin') {
        return res.status(403).json({
            mensaje: 'Acceso denegado. Se requieren permisos de administrador'
        });
    }
    next();
}; 