const Categoria = require('../models/categoria');
const Desarrollador = require('../models/desarrollador');
const Plataforma = require('../models/plataforma');
const Genero = require('../models/genero');
const Producto = require('../models/producto');

exports.getIndexAdmin = (req, res) => {
  if (!req.session.autenticado || req.session.tipoUsuario !== 'admin') {
    return res.redirect('/login');
  }

  // Usamos Promise.all para ejecutar las consultas de manera paralela
  Promise.all([
    Producto.find(), // Obtener productos
    Categoria.find(), // Obtener categorías
    Desarrollador.find(), // Obtener desarrolladores
    Plataforma.find(), // Obtener plataformas
    Genero.find() // Obtener géneros
  ])
    .then(([productos, categorias, desarrolladores, plataformas, generos]) => {
      res.render('admin/index-admin', {
        path: 'admin/index-admin',
        titulo: 'Administración',
        autenticado: req.session.autenticado,
        tipoUsuario: req.session.tipoUsuario,
        prods: productos, // Pasar los productos al render
        categorias, // Pasar las categorías
        desarrolladores, // Pasar los desarrolladores
        plataformas, // Pasar las plataformas
        generos // Pasar los géneros
      });
    })
    .catch(err => {
      console.error('Error al obtener datos:', err);
    });
};


// exports.getCrearProducto = (req, res, next) => {
//     res.render('admin/editar-producto', { 
//         titulo: 'Crear Producto',
//         path: '/admin/crear-producto',
//         modoEdicion: false
//     });
// };

exports.postCrearProducto = (req, res, next) => {
    const nombre = req.body.nombre;
    const urlImagen = req.body.urlImagen;
    const precio = req.body.precio;
    const descripcion = req.body.descripcion;
    console.log(req.session.usuario)
    const producto = new Producto({nombre: nombre, precio: precio, descripcion: descripcion, urlImagen: urlImagen, idUsuario: req.session.usuario._id
    });
    producto
        .save()
        .then(result => {
        // console.log(result);
        console.log('Producto Creado');
        res.redirect('/admin/');
        })
        .catch(err => {
        console.log(err);
        });
};

exports.getEditarProducto = (req, res, next) => {
  const modoEdicion = req.query.editar;
  if (!modoEdicion) {
    return res.redirect('/');
  }
  const idProducto = req.params.idProducto;
  Producto.findById(idProducto)
    .then(producto => {
      if (!producto) {
        return res.redirect('/');
      }
      res.render('admin/editar-producto', {
        titulo: 'Editar Producto',
        path: '/admin/edit-producto',
        modoEdicion: true,
        producto: producto
      });
    })
  .catch(err => console.log(err));
};


exports.postEditarProducto = (req, res, next) => {
  const idProducto = req.body.idProducto;
  const nombre = req.body.nombre;
  const precio = req.body.precio;
  const urlImagen = req.body.urlImagen;
  const descripcion = req.body.descripcion;

  Producto.findById(idProducto)
    .then(producto => {
      producto.nombre = nombre;
      producto.precio = precio;
      producto.descripcion = descripcion;
      producto.urlImagen = urlImagen;
      return producto.save();
    })
    .then(result => {
      console.log('PRODUCTO GUARDADO!');
      res.redirect('/admin/productos');
    })
    .catch(err => console.log(err));
}; 

exports.getProductos = (req, res, next) => {
  Producto
    .find()
    //.select('nombre precio -_id')
    .then(productos => {
      console.log(productos)
      res.render('admin/productos', {
        prods: productos,
        titulo: 'Admin Productos',
        path: '/admin/productos'
      });
    })
    .catch(err => console.log(err));
    };


exports.postEliminarProducto = (req, res, next) => {
  const idProducto = req.body.idProducto;
  Producto.findByIdAndDelete(idProducto)
    .then(() => {
      console.log('PRODUCTO ELIMINADO');
      res.redirect('/admin/productos');
    })
    .catch(err => console.log(err));
}; 