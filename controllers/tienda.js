
exports.getIndex = (req, res, next) => {
    res.render('tienda/index', {
        titulo: 'Tienda',
        path: '/'
    });
};