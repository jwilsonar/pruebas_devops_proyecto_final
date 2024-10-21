const Producto = require('../models/producto');
const Carrito = require('../models/carrito');

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
exports.getCarrito = (req, res, next) => {
    Carrito.getCarrito(carrito => {
        Producto.fetchAll(productos => {
        const productosCarrito = [];
        for (producto of productos) {
            const productoEnCarrito = carrito.productos.find(
                prod => prod.id === producto.id
            );
            if (productoEnCarrito) {
            productosCarrito.push({ dataProducto: producto, cantidad: productoEnCarrito.cantidad });
            }
        }
        res.render('tienda/carrito', {
                path: '/carrito',
                titulo: 'Mi Carrito',
                productos: productosCarrito,
                precioTotal: carrito.precioTotal
            });
        });
    });
};

exports.postCarrito = (req, res, next) => {
    const idProducto = req.body.idProducto;
    Producto.findById(idProducto, producto => {
        Carrito.agregarProducto(idProducto, producto.precio);
        res.redirect('/carrito');
    });
};

exports.postEliminarProductoCarrito = (req, res, next) => {
    const idProducto = req.body.idProducto;
    Producto.findById(idProducto, producto => {
        Carrito.eliminarProducto(idProducto, producto.precio);
        res.redirect('/carrito');
    });
};