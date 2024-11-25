const Producto = require('../models/producto');
const Pedido = require('../models/pedido');
const Usuario = require('../models/usuario')
const Categoria = require('../models/categoria')
const Genero = require('../models/genero');
const Desarrollador = require('../models/desarrollador');

exports.getProductos = (req, res, next) => {
  Producto.find()
    .then(productos => {
      res.render('tienda/lista-productos', {
        productos: productos,
        titulo: 'Todos los Productos',
        path: '/productos',
        autenticado: req.session.autenticado,
        tipoUsuario: req.session.tipoUsuario
      });
    })
  .catch(err => {
    console.log(err);
  });
};

exports.getProducto = (req, res, next) => {
  Producto.findOne({slug: req.params.slug})
    .then(producto => {
      res.render('tienda/detalle-producto', {
        producto: producto,
        titulo: producto.nombre,
        path: '/productos',
        autenticado: req.session.autenticado,
        tipoUsuario: req.session.tipoUsuario
      });
    })
    .catch(err => console.log(err));
};


exports.getIndex = (req, res, next) => {
  Producto.find()
  .then(productos => {
    res.render('tienda/index', {
      prods: productos,
      titulo: 'Tienda',
      path: '/',
      autenticado: req.session.autenticado,
      tipoUsuario: req.session.tipoUsuario
    });
  })
  .catch(err => {
    console.log(err);
  });
};

exports.getCarrito = (req, res, next) => {
  Usuario.findById(req.session.usuario._id).then(user=>{
    user.populate('carrito.items.idProducto')
    .then(usuario => {
      const productos = usuario.carrito.items;
      console.log("Carrito")
      
      let precioTotal = 0;
      productos.forEach(p=>precioTotal+=(p.idProducto.precio*p.cantidad))
      let carrito = {
        productos,
        precioTotal
      }
      console.log(carrito)
      res.render('tienda/carrito', {
        path: '/carrito',
        titulo: 'Mi Carrito',
        carrito: carrito,
        autenticado: req.session.autenticado,
        tipoUsuario: req.session.tipoUsuario
      });
    })
    .catch(err => console.log(err))})
};

exports.postCarrito = (req, res, next) => {
  const idProducto = req.body.idProducto;
  Producto.findById(idProducto)
    .then(producto => {
      if(!producto) res.redirect('/');
      return Usuario.findById(req.session.usuario._id).then(usuario=>{
        return usuario.agregarAlCarrito(producto);
      }).catch(err=>{
        console.log("Error al agregar al carrito")
        res.redirect('/')
      })
    })
    .then(result => {
      console.log(result);
      res.redirect('/carrito');
    });
};

exports.postEliminarProductoCarrito = (req, res, next) => {
  const idProducto = req.body.idProducto;
  req.usuario
    .deleteItemDelCarrito(idProducto)
    .then(result => {
      res.redirect('/carrito');
    })
    .catch(err => console.log(err));
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

exports.getCategorias=(req, res, next)=>{
  Categoria.find().then(categorias => {
    let cat = []
    if(categorias) cat=categorias;
    res.render('tienda/categorias',{
      titulo: 'Categorías',
      categorias: cat,
      path: 'tienda/categorias',
      autenticado: req.session.autenticado,
      tipoUsuario: req.session.tipoUsuario
    })
  })
}

exports.getCategoria=(req, res, next)=>{
  Categoria.findOne({slug: req.params.slug}).then(categoria => {
    Producto.find({idCategoria: categoria._id}).then(productos=>{
      let prods = []
      if(productos) prods = productos;
      res.render('tienda/detalle-categoria',{
        titulo: 'Categoría Interna',
        productos: prods,
        path: 'tienda/categorias',
        autenticado: req.session.autenticado,
        tipoUsuario: req.session.tipoUsuario
      })
    })
    
  })
}

exports.getGeneros=(req, res, next)=>{
  Genero.find().then(generos => {
    let gene = []
    if(generos) gene=generos;
    res.render('tienda/generos',{
      titulo: 'Categorías',
      generos: gene,
      path: 'tienda/generos',
      autenticado: req.session.autenticado,
      tipoUsuario: req.session.tipoUsuario
    })
  })
}


exports.getGenero=(req, res, next)=>{
  Genero.findOne({slug: req.params.slug}).then(genero => {
    Producto.find({idGenero: genero._id}).then(productos=>{
      let prods = []
      if(productos) prods = productos;
      res.render('tienda/detalle-genero',{
        titulo: 'Categoría Interna',
        productos: prods,
        path: 'tienda/generos',
        autenticado: req.session.autenticado,
        tipoUsuario: req.session.tipoUsuario
      })
    })
    
  })
}

exports.getDesarrolladores=(req, res, next)=>{
  Desarrollador.find().then(desarrolladors => {
    let desa = []
    if(desarrolladors) desa=desarrolladors;
    res.render('tienda/desarrolladores',{
      titulo: 'Desarrolladores',
      desarrolladores: desa,
      path: 'tienda/desarrolladores',
      autenticado: req.session.autenticado,
      tipoUsuario: req.session.tipoUsuario
    })
  })
}

exports.getDesarrollador=(req, res, next)=>{
  Desarrollador.findOne({slug: req.params.slug}).then(desarrollador => {
    Producto.find({idDesarrollador: desarrollador._id}).then(productos=>{
      let prods = []
      if(productos) prods = productos;
      res.render('tienda/detalle-desarrollador',{
        titulo: 'Desarrollador Interna',
        productos: prods,
        path: 'tienda/generos',
        autenticado: req.session.autenticado,
        tipoUsuario: req.session.tipoUsuario
      })
    })
    
  })
}