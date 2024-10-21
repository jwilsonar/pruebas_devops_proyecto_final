const Producto = require('../models/producto');

exports.getCrearProducto=(req, res)=>{
    res.render('admin/editar-producto.ejs',{
        titulo: 'Crear Producto',
        path: '/admin/crear-producto',
        modoEdicion: false
    })
}
exports.postCrearProducto = (req, res, next) => {
    const nombre = req.body.nombre;
    const urlImagen = req.body.urlImagen;
    const precio = req.body.precio;
    const descripcion = req.body.descripcion;
    const producto = new Producto(null, nombre, urlImagen, descripcion, precio);
    producto.save();
    res.redirect('/')
};