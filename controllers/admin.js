const Categoria = require('../models/categoria');
const Desarrollador = require('../models/desarrollador');
const Plataforma = require('../models/plataforma');
const Genero = require('../models/genero');
const Producto = require('../models/producto');
const fileHelper = require('../utils/fileHelper');
const Pedido = require('../models/pedido');
const { validationResult } = require('express-validator');

exports.getIndexAdmin = (req, res) => {
    Promise.all([
        Producto.find(),
        Categoria.find(),
        Desarrollador.find(),
        Plataforma.find(),
        Genero.find()
    ])
        .then(([productos, categorias, desarrolladores, plataformas, generos]) => {
            res.status(200).json({
                productos,
                categorias,
                desarrolladores,
                plataformas,
                generos
            });
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Error al obtener datos',
                error: err
            });
        });
};

exports.getProductos = (req, res) => {
    Promise.all([
        Producto.find(),
        Categoria.find(),
        Desarrollador.find(),
        Plataforma.find(),
        Genero.find()
    ])
        .then(([productos, categorias, desarrolladores, plataformas, generos]) => {
            res.status(200).json({
                productos,
                categorias,
                desarrolladores,
                plataformas,
                generos
            });
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Error al obtener productos',
                error: err
            });
        });
};

exports.getDetalleProducto = (req, res) => {
    const idProducto = req.params.idProducto;

    Promise.all([
        Producto.findById(idProducto),
        Categoria.find(),
        Desarrollador.find(),
        Plataforma.find(),
        Genero.find()
    ])
        .then(([producto, categorias, desarrolladores, plataformas, generos]) => {
            if (!producto) {
                return res.status(404).json({
                    mensaje: 'Producto no encontrado'
                });
            }
            res.status(200).json({
                producto,
                categorias,
                desarrolladores,
                plataformas,
                generos
            });
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Error al obtener detalles del producto',
                error: err
            });
        });
};

exports.postCrearProducto = async (req, res) => {
    console.log(req.session);
    try {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                mensaje: errors.array()[0].msg,
                errores: errors.array()
            });
        }

        if (!req.file) {
            return res.status(422).json({
                mensaje: 'La imagen es requerida'
            });
        }

        const producto = new Producto({
            ...req.body,
            imagen_portada: req.file.path,
            idUsuario: req.session.usuario._id
        });

        const productoGuardado = await producto.save();

        res.status(201).json({
            mensaje: 'Producto creado exitosamente',
            producto: productoGuardado
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear el producto',
            error: error.message
        });
    }
};

exports.postEditarProducto = (req, res) => {
    const { idProducto, nombre, precio, descripcion, stock, categoria, marca, desarrollador, plataforma, genero } = req.body;
    const imagen = req.file;

    Producto.findById(idProducto)
        .then(producto => {
            if (!producto) {
                return res.status(404).json({
                    mensaje: 'Producto no encontrado'
                });
            }

            producto.nombre = nombre;
            producto.precio = precio;
            producto.descripcion = descripcion;
            producto.stock = stock;
            producto.idCategoria = categoria;
            producto.marca = marca;
            producto.idDesarrollador = desarrollador;
            producto.idPlataforma = plataforma;
            producto.idGenero = genero;

            if (imagen) {
                fileHelper.deleteFile(producto.imagen_portada);
                producto.imagen_portada = imagen.path;
                producto.imagenes = [imagen.path];
            }

            return producto.save();
        })
        .then(resultado => {
            res.status(200).json({
                mensaje: 'Producto actualizado exitosamente',
                producto: resultado
            });
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Error al actualizar el producto',
                error: err
            });
        });
};

exports.postEliminarProducto = (req, res) => {
    const { idProducto } = req.body;
    
    Producto.findById(idProducto)
        .then(producto => {
            if (!producto) {
                return res.status(404).json({
                    mensaje: 'Producto no encontrado'
                });
            }
            
            if (producto.imagen_portada) {
                fileHelper.deleteFile(producto.imagen_portada);
            }
            
            return Producto.findByIdAndDelete(idProducto);
        })
        .then(() => {
            res.status(200).json({
                mensaje: 'Producto eliminado exitosamente'
            });
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Error al eliminar el producto',
                error: err
            });
        });
};

exports.getCategorias = (req, res) => {
    Categoria.find()
        .then(categorias => {
            res.status(200).json({
                categorias: categorias
            });
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Error al obtener categorías',
                error: err
            });
        });
};

exports.postCrearCategoria = (req, res) => {
    const { nombre, descripcion } = req.body;
    const imagen = req.file;

    const categoria = new Categoria({
        nombre,
        descripcion,
        imagen: imagen ? imagen.path : null
    });

    categoria.save()
        .then(resultado => {
            res.status(201).json({
                mensaje: 'Categoría creada exitosamente',
                categoria: resultado
            });
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Error al crear la categoría',
                error: err
            });
        });
};

exports.postEditarCategoria = (req, res) => {
    // Implementa la lógica para editar una categoría aquí
};

exports.postEliminarCategoria = (req, res) => {
    // Implementa la lógica para eliminar una categoría aquí
};

exports.getDesarrolladores = (req, res) => {
    // Implementa la lógica para obtener desarrolladores aquí
};

exports.postCrearDesarrollador = (req, res) => {
    // Implementa la lógica para crear un desarrollador aquí
};

exports.postEditarDesarrollador = (req, res) => {
    // Implementa la lógica para editar un desarrollador aquí
};

exports.postEliminarDesarrollador = (req, res) => {
    // Implementa la lógica para eliminar un desarrollador aquí
};

exports.getGeneros = (req, res) => {
    // Implementa la lógica para obtener géneros aquí
};

exports.postCrearGenero = (req, res) => {
    // Implementa la lógica para crear un género aquí
};

exports.postEditarGenero = (req, res) => {
    // Implementa la lógica para editar un género aquí
};

exports.postEliminarGenero = (req, res) => {
    // Implementa la lógica para eliminar un género aquí
};

exports.getPlataformas = (req, res) => {
    // Implementa la lógica para obtener plataformas aquí
};

exports.postCrearPlataforma = (req, res) => {
    // Implementa la lógica para crear una plataforma aquí
};

exports.postEditarPlataforma = (req, res) => {
    // Implementa la lógica para editar una plataforma aquí
};

exports.postEliminarPlataforma = (req, res) => {
    // Implementa la lógica para eliminar una plataforma aquí
};

exports.getPedidos = (req, res) => {
    Pedido.find()
        .populate('usuario.idUsuario')
        .then(pedidos => {
            res.status(200).json({
                pedidos: pedidos
            });
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Error al obtener pedidos',
                error: err
            });
        });
};

exports.crearProducto = async (req, res) => {
    try {
        const { nombre, precio, descripcion, stock, categoria, marca } = req.body;

        // Validar campos requeridos
        if (!nombre || !precio || !descripcion || !stock || !categoria || !marca) {
            return res.status(422).json({
                mensaje: 'Todos los campos son requeridos'
            });
        }

        // Validar que el precio y el stock sean números
        if (isNaN(precio) || isNaN(stock)) {
            return res.status(422).json({
                mensaje: 'El precio y el stock deben ser números'
            });
        }

        const producto = new Producto({
            nombre,
            precio,
            descripcion,
            stock,
            categoria,
            marca,
            imagen_portada: req.file ? req.file.path : null
        });

        await producto.save();

        res.status(201).json({
            mensaje: 'Producto creado exitosamente',
            producto: producto
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear producto',
            error: error.message
        });
    }
};

// Continúa con el resto de los controladores siguiendo el mismo patrón...