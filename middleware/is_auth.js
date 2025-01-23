module.exports = (req, res, next) => {
    console.log(req.session);
    console.log(req.session.autenticado);
    console.log(req.session.usuario);
    if (!req.session || !req.session.autenticado || !req.session.usuario) {
        return res.status(401).json({
            mensaje: 'No autorizado'
        });
    }
    next();
};