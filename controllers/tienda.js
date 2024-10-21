const Producto = require('../models/producto');

exports.getIndex = (req, res, next) => {
    Producto.fetchAll(productos => {
        res.render('tienda/index', {
            prods: productos,
            titulo: 'Tienda',
            path: '/'
        });
    });
};
exports.getProductos = (req, res, next) => {
    Producto.fetchAll(productos => {
        res.render('tienda/lista-productos', {prods: productos, titulo: 'Todos los Productos', path: '/productos'});
    });
};