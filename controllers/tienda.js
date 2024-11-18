const Producto = require('../models/producto');
const Pedido = require('../models/pedido');


exports.getProductos = (req, res, next) => {
  Producto.find()
    .then(productos => {
      res.render('tienda/lista-productos', {
        prods: productos,
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
  const idProducto = req.params.idProducto;
  Producto.findById(idProducto)
    .then(producto => {
      res.render('tienda/detalle-producto', {
        producto: producto,
        titulo: producto.nombre,
        path: '/productos'
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
  req.usuario
    .populate('carrito.items.idProducto')
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
        carrito: carrito
      });
    })
    .catch(err => console.log(err));
};

exports.postCarrito = (req, res, next) => {
  const idProducto = req.body.idProducto;
  Producto.findById(idProducto)
    .then(producto => {
      return req.usuario.agregarAlCarrito(producto);
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

