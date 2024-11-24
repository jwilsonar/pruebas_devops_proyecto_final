const Categoria = require('../models/categoria');
const Desarrollador = require('../models/desarrollador');
const Plataforma = require('../models/plataforma');
const Genero = require('../models/genero');
const Producto = require('../models/producto');
const fileHelper = require ('../utils/fileHelper')
const axios = require('axios')

exports.getIndexAdmin = (req, res) => {

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
        path: 'admin',
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
    const precio = req.body.precio;
    const descripcion = req.body.descripcion;
    const stock = req.body.stock;
    const imagen = req.file;
    const categoria = req.body.categoria;
    const marca = req.body.marca;
    const tags = req.body.tags ? req.body.tags.split(',') : [];  // Si hay tags, separarlos por coma
    const desarrollador = req.body.desarrollador;
    const plataforma = req.body.plataforma;
    const genero = req.body.genero;

    const producto = new Producto({
        nombre: nombre,
        precio: precio,
        descripcion: descripcion,
        stock: stock,
        idCategoria: categoria,  // Asignación de categoria con ObjectId
        marca: marca,
        tags: tags,
        idUsuario: req.session.usuario._id,
        idDesarrollador: desarrollador,  // Asignación de desarrollador con ObjectId
        idPlataforma: plataforma,  // Asignación de plataforma con ObjectId
        idGenero: genero,  // Asignación de genero con ObjectId
        imagen_portada: imagen ? imagen.path : '', // Si se sube una imagen, se asigna su path
        publicado: true,  // Si está publicado
        valoracion: 0, // Valoración inicial
    });

    // Si se ha cargado una imagen adicional, agregarla al campo imagenes
    if (imagen) {
        producto.imagenes.push(imagen.path);
    }

    // Guardar el producto en la base de datos
    producto
        .save()
        .then(result => {
            console.log('Producto Creado');
            res.redirect('productos');
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Error al guardar el producto");
        });
};

exports.getDetalleProducto = (req, res, next) => {
  const idProducto = req.params.idProducto;

  Producto.findById(idProducto)
    .populate('idGenero') // Población para el campo idGenero
    .populate('idPlataforma') // Población para el campo idPlataforma
    .populate('idCategoria') // Población para el campo idCategoria
    .populate('idDesarrollador') // Población para el campo idDesarrollador
    .populate('idUsuario') // Población para el campo idUsuario
    .then(producto => {
      if (!producto) {
        return res.redirect('admin');
      }
      console.log(producto);
      res.render('admin/detalle-producto', {
        titulo: 'Editar Producto',
        path: '/admin/detalle-producto',
        modoEdicion: true,
        producto: producto,
      });
    })
    .catch(err => console.error(err));
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
  Promise.all([
    Producto.find(), // Obtener productos
    Categoria.find(), // Obtener categorías
    Desarrollador.find(), // Obtener desarrolladores
    Plataforma.find(), // Obtener plataformas
    Genero.find() // Obtener géneros
  ])
    .then(([productos, categorias, desarrolladores, plataformas, generos]) => {
      res.render('admin/productos', {
        path: 'admin/productos',
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


exports.postEliminarProducto = (req, res, next) => {
  const idProducto = req.body.idProducto;
  Producto.findByIdAndDelete(idProducto)
    .then(() => {
      console.log('PRODUCTO ELIMINADO');
      res.redirect('/admin/productos');
    })
    .catch(err => console.log(err));
}; 

exports.getCategorias=(req, res, next)=>{
  Categoria.find().then(categorias=>{
    let cat = []
    if(categorias) cat = categorias;
    res.render('admin/categorias',{
      path:'admin/categorias',
      titulo: "Categorías",
      categorias: cat,
      usuario: req.session.usuario
    })
  })
}


exports.postCrearCategoria = (req, res, next) => {
  const { nombre, descripcion } = req.body;
  const imagen = req.file;
  console.log("imagen: ", imagen);

  Categoria.findOne({ nombre })
    .then((categoriaExistente) => {
      if (categoriaExistente) {
        console.log("La categoría ya existe");
        return res.redirect('categorias'); // Redirige si ya existe
      }

      const nuevaCategoria = new Categoria({ nombre, descripcion });
      if(imagen){
        nuevaCategoria.imagen = imagen.path;
      }
      return nuevaCategoria.save().then((resultado) => {
        console.log("Categoría creada con éxito");
        res.redirect('categorias'); // Redirige después de guardar
      });
    })
    .catch((err) => {
      console.error("Error al crear la categoría:", err);
      res.status(500).send("Hubo un error al crear la categoría.");
    });
};

exports.postEliminarCategoria=(req,res, next)=>{
  const id= req.body._id;
  console.log(id)
  Categoria.findById({_id: id}).then(cat=>{
    fileHelper.deleteFile(cat.imagen)
    Categoria.deleteOne({_id: id}).then(
      result=>{
        console.log(result)
        res.redirect('categorias');
      }
    ).catch(
      err=>{
        console.log("Error al eliminar la categoría")
        res.status(500).send("Hubo un error al crear la categoría.");
      }
    )
  }).catch(
    err=>{
      console.log("No existe la categoría.")
      res.status(500).send("Hubo un error al crear la categoría.");
    }
  )
}

exports.postEditarCategoria = (req, res, next) => {
  const id = req.body._id;
  const nombre = req.body.nombre;
  const descripcion = req.body.descripcion;
  const nuevaImagen = req.file;
  Categoria.findById({_id: id})
    .then((categoria) => {
      if (!categoria) {
        console.log("No se encontró la categoría.");
        return res.status(404).send("Categoría no encontrada.");
      }

      // Actualizar los campos de la categoría
      categoria.nombre = nombre;
      categoria.descripcion = descripcion;

      // Si hay una nueva imagen, actualizamos y eliminamos la anterior
      if (nuevaImagen) {
        fileHelper.deleteFile(categoria.imagen); // Elimina la imagen antigua
        categoria.imagen = nuevaImagen.path; // Asignar el nuevo path de la imagen
      }

      return categoria.save(); // Guardar los cambios en la base de datos
    })
    .then((resultado) => {
      console.log("Categoría actualizada:", resultado);
      res.redirect('categorias'); // Redirigir después de la actualización
    })
    .catch((err) => {
      console.error("Error al editar la categoría:", err);
      res.status(500).send("Hubo un error al editar la categoría.");
    });
};

exports.getDesarrolladores = (req, res, next) => {
    // Obtener los desarrolladores
    Desarrollador.find().then((desarrollador) => {
        if (!desarrollador) {
            console.error(err);
            return res.status(500).send('Error al obtener los desarrolladores.');
        }

        let desa = [];
        if (desarrollador) desa = desarrollador;

        // Obtener los nombres de los países usando Axios
        axios.get('https://restcountries.com/v3.1/all')
            .then(response => {
                const paises = response.data.map(country => country.name.common);

                // Renderizar la vista con desarrolladores y países
                res.render('admin/desarrolladores', {
                    path: 'admin/desarrolladores',
                    titulo: "Categorías",
                    desarrolladores: desa,
                    paises: paises,
                    usuario: req.session.usuario
                });
            })
            .catch(error => {
                console.error(error);
                res.status(500).send('Error al obtener los países.');
            });
    });
};


exports.postCrearDesarrollador = (req, res, next) => {
  const { nombre, descripcion, pais, fechaFundacion } = req.body;
  const imagen = req.file;
  console.log("imagen: ", imagen);

  Desarrollador.findOne({ nombre })
      .then((desaExistente) => {
          if (desaExistente) {
              console.log("El desarrollador ya existe");
              return res.redirect('desarrolladores'); // Redirige si ya existe
          }

          const nuevoDesarrollador = new Desarrollador({
              nombre,
              descripcion,
              pais,
              fechaFundacion: fechaFundacion ? new Date(fechaFundacion) : null,
          });

          if (imagen) {
              nuevoDesarrollador.imagen = imagen.path;
          }

          return nuevoDesarrollador.save().then((resultado) => {
              console.log("Desarrollador creado con éxito");
              res.redirect('desarrolladores'); // Redirige después de guardar
          });
      })
      .catch((err) => {
          console.error("Error al crear el desarrollador:", err);
          res.status(500).send("Hubo un error al crear el desarrollador.");
      });
};


exports.postEditarDesarrollador=(req,res, next)=>{
  const id = req.body._id;
  const nombre = req.body.nombre;
  const descripcion = req.body.descripcion;
  const nuevaImagen = req.file;
  Desarrollador.findById({_id: id})
    .then((desarrollador) => {
      if (!desarrollador) {
        console.log("No se encontró el desarrollador.");
        return res.status(404).send("Desarrollador no encontrado.");
      }

      // Actualizar los campos del desarrollador
      desarrollador.nombre = nombre;
      desarrollador.descripcion = descripcion;

      // Si hay una nueva imagen, actualizamos y eliminamos la anterior
      if (nuevaImagen) {
        fileHelper.deleteFile(desarrollador.imagen); // Elimina la imagen antigua
        desarrollador.imagen = nuevaImagen.path; // Asignar el nuevo path de la imagen
      }

      return desarrollador.save(); // Guardar los cambios en la base de datos
    })
    .then((resultado) => {
      console.log("Desarrollador actualizado:", resultado);
      res.redirect('desarrolladores'); // Redirigir después de la actualización
    })
    .catch((err) => {
      console.error("Error al editar el desarrollador:", err);
      res.status(500).send("Hubo un error al editar el desarrollador.");
    });
}

exports.postEliminarDesarrollador=(req, res, next)=>{
  const id= req.body._id;
  console.log(id)
  Desarrollador.findById({_id: id}).then(cat=>{
    fileHelper.deleteFile(cat.imagen)
    Desarrollador.deleteOne({_id: id}).then(
      result=>{
        console.log(result)
        res.redirect('desarrolladores');
      }
    ).catch(
      err=>{
        console.log("Error al eliminar el desarrollador")
        res.status(500).send("Hubo un error al eliminar el desarrollador.");
      }
    )
  }).catch(
    err=>{
      console.log("No existe el desarrollador.")
      res.status(500).send("Hubo un error al eliminar el desarrollador.");
    }
  )
}

//================== PLATAFORMAS ==========================//

exports.getPlataformas=(req,res,next)=>{
  Plataforma.find().then(plataformas=>{
    let plat = []
    if(plataformas) plat = plataformas;
    res.render('admin/plataformas',{
      path:'admin/plataformas',
      titulo: "Plataformas",
      plataformas: plat,
      usuario: req.session.usuario
    })
  })
}

exports.postCrearPlataforma=(req, res, next)=>{
  const { nombre, descripcion } = req.body;
  const imagen = req.file;
  console.log("imagen: ", imagen);

  Plataforma.findOne({ nombre })
    .then((plataformaExistente) => {
      if (plataformaExistente) {
        console.log("La plataforma ya existe");
        return res.redirect('plataformas'); // Redirige si ya existe
      }

      const nuevaPlataforma = new Plataforma({ nombre, descripcion });
      if(imagen){
        nuevaPlataforma.imagen = imagen.path;
      }
      return nuevaPlataforma.save().then((resultado) => {
        console.log("Plataforma creada con éxito");
        res.redirect('plataformas'); // Redirige después de guardar
      });
    })
    .catch((err) => {
      console.error("Error al crear la plataforma:", err);
      res.status(500).send("Hubo un error al crear la plataforma.");
    });
}

exports.postEditarPlataforma=(req, res, next)=>{
  const id = req.body._id;
  const nombre = req.body.nombre;
  const descripcion = req.body.descripcion;
  const nuevaImagen = req.file;
  Plataforma.findById({_id: id})
    .then((plataforma) => {
      if (!plataforma) {
        console.log("No se encontró la Plataforma.");
        return res.status(404).send("Plataforma no encontrada.");
      }

      // Actualizar los campos de la Plataforma
      plataforma.nombre = nombre;
      plataforma.descripcion = descripcion;

      // Si hay una nueva imagen, actualizamos y eliminamos la anterior
      if (nuevaImagen) {
        fileHelper.deleteFile(plataforma.imagen); // Elimina la imagen antigua
        plataforma.imagen = nuevaImagen.path; // Asignar el nuevo path de la imagen
      }

      return plataforma.save(); // Guardar los cambios en la base de datos
    })
    .then((resultado) => {
      console.log("Plataforma actualizada:", resultado);
      res.redirect('plataformas'); // Redirigir después de la actualización
    })
    .catch((err) => {
      console.error("Error al editar la Plataforma:", err);
      res.status(500).send("Hubo un error al editar la Plataforma.");
    });
}

exports.postEliminarPlataforma=(req, res, next)=>{
  const id= req.body._id;
  console.log(id)
  Plataforma.findById({_id: id}).then(cat=>{
    fileHelper.deleteFile(cat.imagen)
    Plataforma.deleteOne({_id: id}).then(
      result=>{
        console.log(result)
        res.redirect('plataformas');
      }
    ).catch(
      err=>{
        console.log("Error al eliminar la Plataforma")
        res.status(500).send("Hubo un error al crear la Plataforma.");
      }
    )
  }).catch(
    err=>{
      console.log("No existe la Plataforma.")
      res.status(500).send("Hubo un error al crear la Plataforma.");
    }
  )
}

//============== GÉNEROS ===============//

exports.getGeneros=(req, res, next)=>{
  Genero.find().then(generos=>{
    let plat = []
    if(generos) plat = generos;
    res.render('admin/generos',{
      path:'admin/generos',
      titulo: "generos",
      generos: plat,
      usuario: req.session.usuario
    })
  })
}
exports.postCrearGenero=(req, res, next)=>{
  const { nombre, descripcion } = req.body;
  const imagen = req.file;
  console.log("imagen: ", imagen);

  Genero.findOne({ nombre })
    .then((generoExistente) => {
      if (generoExistente) {
        console.log("La genero ya existe");
        return res.redirect('generos'); // Redirige si ya existe
      }

      const nuevaGenero = new Genero({ nombre, descripcion });
      if(imagen){
        nuevaGenero.imagen = imagen.path;
      }
      return nuevaGenero.save().then((resultado) => {
        console.log("Genero creada con éxito");
        res.redirect('generos'); // Redirige después de guardar
      });
    })
    .catch((err) => {
      console.error("Error al crear la genero:", err);
      res.status(500).send("Hubo un error al crear la genero.");
    });
}
exports.postEditarGenero=(req, res, next)=>{
  const id = req.body._id;
  const nombre = req.body.nombre;
  const descripcion = req.body.descripcion;
  const nuevaImagen = req.file;
  Genero.findById({_id: id})
    .then((genero) => {
      if (!genero) {
        console.log("No se encontró la Genero.");
        return res.status(404).send("Genero no encontrada.");
      }

      // Actualizar los campos de la Genero
      genero.nombre = nombre;
      genero.descripcion = descripcion;

      // Si hay una nueva imagen, actualizamos y eliminamos la anterior
      if (nuevaImagen) {
        fileHelper.deleteFile(genero.imagen); // Elimina la imagen antigua
        genero.imagen = nuevaImagen.path; // Asignar el nuevo path de la imagen
      }

      return genero.save(); // Guardar los cambios en la base de datos
    })
    .then((resultado) => {
      console.log("Genero actualizada:", resultado);
      res.redirect('generos'); // Redirigir después de la actualización
    })
    .catch((err) => {
      console.error("Error al editar la Genero:", err);
      res.status(500).send("Hubo un error al editar la Genero.");
    });
}
exports.postEliminarGenero=(req, res, next)=>{
  const id= req.body._id;
  console.log(id)
  Genero.findById({_id: id}).then(cat=>{
    fileHelper.deleteFile(cat.imagen)
    Genero.deleteOne({_id: id}).then(
      result=>{
        console.log(result)
        res.redirect('generos');
      }
    ).catch(
      err=>{
        console.log("Error al eliminar la genero")
        res.status(500).send("Hubo un error al crear la genero.");
      }
    )
  }).catch(
    err=>{
      console.log("No existe la genero.")
      res.status(500).send("Hubo un error al crear la genero.");
    }
  )
}