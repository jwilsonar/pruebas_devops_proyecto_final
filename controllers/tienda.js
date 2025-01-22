const Producto = require('../models/producto');
const Pedido = require('../models/pedido');
const Usuario = require('../models/usuario');
const Categoria = require('../models/categoria');
const Genero = require('../models/genero');
const Desarrollador = require('../models/desarrollador');
const isAuth = require('../middleware/is_auth');

exports.getProductos = async (req, res) => {
    try {
        const { categoria, marca } = req.query;
        let filtro = {};

        if (categoria) {
            filtro.categoria = categoria;
        }

        if (marca) {
            filtro.marca = marca;
        }

        const productos = await Producto.find(filtro);
        res.status(200).json({
            productos: productos
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener productos',
            error: error.message
        });
    }
};

exports.getProducto = async (req, res) => {
    try {
        const producto = await Producto.findOne({ slug: req.params.slug });
        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }
        res.status(200).json({
            producto: producto
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener el producto',
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

        const itemCarrito = usuario.carrito.items.find(item => 
            item.idProducto.toString() === idProducto
        );

        if (itemCarrito) {
            if (producto.stock < (itemCarrito.cantidad + cantidad)) {
                return res.status(400).json({
                    mensaje: 'Stock insuficiente para la cantidad total',
                    stockDisponible: producto.stock
                });
            }
        }

        producto.stock -= cantidad;
        await producto.save();

        await usuario.agregarAlCarrito(producto);

        const carritoActualizado = await Usuario.findById(usuario._id)
            .populate('carrito.items.idProducto');

        res.status(200).json({
            mensaje: 'Producto agregado al carrito',
            carrito: carritoActualizado.carrito
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al agregar al carrito',
            error: error.message
        });
    }
};

exports.postEliminarProductoCarrito = async (req, res) => {
    try {
        if (!req.session || !req.session.autenticado || !req.session.usuario) {
            return res.status(401).json({
                mensaje: 'No autorizado'
            });
        }

        const { idProducto } = req.body;

        const producto = await Producto.findById(idProducto);
        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        const usuario = await Usuario.findById(req.session.usuario._id);
        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        const itemCarrito = usuario.carrito.items.find(item => 
            item.idProducto.toString() === idProducto
        );

        if (!itemCarrito) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado en el carrito'
            });
        }

        producto.stock += itemCarrito.cantidad;
        await producto.save();

        await usuario.deleteItemDelCarrito(idProducto);

        res.status(200).json({
            mensaje: 'Producto eliminado del carrito'
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar del carrito',
            error: error.message
        });
    }
};

exports.postVaciarCarrito = async (req, res) => {
    try {
        if (!req.session || !req.session.autenticado || !req.session.usuario) {
            return res.status(401).json({
                mensaje: 'No autorizado'
            });
        }

        const usuario = await Usuario.findById(req.session.usuario._id);
        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        for (const item of usuario.carrito.items) {
            const producto = await Producto.findById(item.idProducto);
            if (producto) {
                producto.stock += item.cantidad;
                await producto.save();
            }
        }

        await usuario.limpiarCarrito();

        res.status(200).json({
            mensaje: 'Carrito vaciado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al vaciar el carrito',
            error: error.message
        });
    }
};

exports.postPedido = (req, res, next) => {
    req.usuario
        .populate('carrito.items.idProducto')
        .then(usuario => {
            const productos = usuario.carrito.items.map(i => {
                return { cantidad: i.cantidad, producto: { ...i.idProducto._doc } };
            });
            const pedido = new Pedido({
                usuario: {
                    nombre: req.usuario.nombre,
                    idUsuario: req.usuario
                },
                productos: productos
            });
            return pedido.save();
        })
        .then(result => {
            return req.usuario.limpiarCarrito();
        })
        .then(() => {
            res.redirect('/pedidos');
        })
        .catch(err => console.log(err));
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

exports.getCategorias = (req, res, next) => {
    Categoria.find()
        .then(categorias => {
            res.status(200).json({
                categorias: categorias || []
            });
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Error al obtener categorías',
                error: err
            });
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