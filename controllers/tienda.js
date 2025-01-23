const Producto = require('../models/producto');
const Pedido = require('../models/pedido');
const Usuario = require('../models/usuario');
const Categoria = require('../models/categoria');
const Genero = require('../models/genero');
const Desarrollador = require('../models/desarrollador');
const isAuth = require('../middleware/is_auth');

exports.getProductos = async (req, res) => {
    try {
        const productos = await Producto.find();
        res.status(200).json({ productos });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener productos',
            error: error.message
        });
    }
};

exports.getProducto = async (req, res) => {
    console.log(req.params);
    try {
        const producto = await Producto.findOne({ slug: req.params.slug });
        console.log(producto);
        if (!producto) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }
        res.status(200).json({ producto });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener el producto',
            error: error.message
        });
    }
};

exports.getCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.find();
        res.status(200).json({ categorias });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener categorías',
            error: error.message
        });
    }
};

exports.getProductosPorCategoria = async (req, res) => {
    try {
        const categoria = await Categoria.findOne({ slug: req.params.slug });
        if (!categoria) {
            return res.status(404).json({ mensaje: 'Categoría no encontrada' });
        }
        const productos = await Producto.find({ idCategoria: categoria._id });
        res.status(200).json({ productos });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener productos por categoría',
            error: error.message
        });
    }
};

exports.getCarrito = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.session.usuario._id)
            .populate('carrito.items.idProducto');

        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        const productosValidos = usuario.carrito.items.filter(item => item.idProducto);
        const precioTotal = productosValidos.reduce((total, item) => {
            return total + (item.idProducto.precio * item.cantidad);
        }, 0);

        res.status(200).json({
            carrito: {
                productos: productosValidos,
                precioTotal: precioTotal.toFixed(2)
            }
        });
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        res.status(500).json({
            mensaje: 'Error al obtener el carrito',
            error: error.message
        });
    }
};

exports.postCarrito = async (req, res) => {
    try {
        const { idProducto, cantidad = 1 } = req.body;

        if (!Number.isInteger(cantidad) || cantidad < 1) {
            return res.status(422).json({
                mensaje: 'La cantidad debe ser un número entero positivo'
            });
        }

        const producto = await Producto.findById(idProducto);
        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        if (producto.stock < cantidad) {
            return res.status(400).json({
                mensaje: 'Stock insuficiente',
                stockDisponible: producto.stock
            });
        }

        const usuario = await Usuario.findById(req.session.usuario._id);
        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        await usuario.agregarAlCarrito(producto, cantidad);
        
        const carritoActualizado = await Usuario.findById(usuario._id)
            .populate('carrito.items.idProducto');

        res.status(200).json({
            mensaje: 'Producto agregado al carrito',
            carrito: carritoActualizado.carrito
        });
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        res.status(500).json({
            mensaje: 'Error al agregar al carrito',
            error: error.message
        });
    }
};

exports.eliminarDelCarrito = async (req, res) => {
    try {
        const { idProducto } = req.body;
        const usuario = await Usuario.findById(req.session.usuario._id);
        
        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        await usuario.eliminarDelCarrito(idProducto);
        res.status(200).json({
            mensaje: 'Producto eliminado del carrito'
        });
    } catch (error) {
        console.error('Error al eliminar del carrito:', error);
        res.status(500).json({
            mensaje: 'Error al eliminar del carrito',
            error: error.message
        });
    }
};

exports.postPedido = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.session.usuario._id)
            .populate('carrito.items.idProducto');

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const productos = usuario.carrito.items.map(i => ({
            cantidad: i.cantidad,
            producto: { ...i.idProducto._doc }
        }));

        const pedido = new Pedido({
            usuario: {
                nombre: usuario.nombres,
                idUsuario: usuario._id
            },
            productos: productos
        });

        await pedido.save();
        await usuario.limpiarCarrito();

        res.status(200).json({
            mensaje: 'Pedido creado exitosamente',
            pedido
        });
    } catch (error) {
        console.error('Error al crear pedido:', error);
        res.status(500).json({
            mensaje: 'Error al crear el pedido',
            error: error.message
        });
    }
};

exports.getPedidos = (req, res, next) => {
    Pedido.find({ 'usuario.idUsuario': req.usuario._id })
        .then(pedidos => {
            res.render('tienda/pedidos', {
                path: '/pedidos',
                titulo: 'Mis Pedidos',
                pedidos: pedidos
            });
        })
        .catch(err => console.log(err));
};

exports.getCheckout = (req, res, next) => {
    res.render('tienda/checkout', {
        path: '/checkout',
        titulo: 'Checkout'
    });
};

exports.getCategoria = (req, res, next) => {
    Categoria.findOne({slug: req.params.slug})
        .then(categoria => {
            if (!categoria) {
                return res.status(404).json({
                    mensaje: 'Categoría no encontrada'
                });
            }
            return Producto.find({idCategoria: categoria._id})
                .then(productos => {
                    res.status(200).json({
                        categoria: categoria,
                        productos: productos || []
                    });
                });
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Error al obtener la categoría',
                error: err
            });
        });
};

exports.getGeneros = (req, res, next) => {
    Genero.find()
        .then(generos => {
            res.status(200).json({
                generos: generos || []
            });
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Error al obtener géneros',
                error: err
            });
        });
};

exports.getGenero = (req, res, next) => {
    Genero.findOne({slug: req.params.slug})
        .then(genero => {
            if (!genero) {
                return res.status(404).json({
                    mensaje: 'Género no encontrado'
                });
            }
            return Producto.find({idGenero: genero._id})
                .then(productos => {
                    res.status(200).json({
                        genero: genero,
                        productos: productos || []
                    });
                });
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Error al obtener el género',
                error: err
            });
        });
};

exports.getDesarrolladores = (req, res, next) => {
    Desarrollador.find()
        .then(desarrolladores => {
            res.status(200).json({
                desarrolladores: desarrolladores || []
            });
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Error al obtener desarrolladores',
                error: err
            });
        });
};

exports.getDesarrollador = (req, res, next) => {
    Desarrollador.findOne({slug: req.params.slug})
        .then(desarrollador => {
            if (!desarrollador) {
                return res.status(404).json({
                    mensaje: 'Desarrollador no encontrado'
                });
            }
            return Producto.find({idDesarrollador: desarrollador._id})
                .then(productos => {
                    res.status(200).json({
                        desarrollador: desarrollador,
                        productos: productos || []
                    });
                });
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Error al obtener el desarrollador',
                error: err
            });
        });
};