const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');
const is_auth = require('../middleware/is_auth')


const router = express.Router();

router.get('/', is_auth, adminController.getIndexAdmin);

//router.get('/crear-producto',is_auth, adminController.getCrearProducto);
router.get('/productos', is_auth, adminController.getProductos);
router.post('/crear-producto', is_auth, adminController.postCrearProducto);
router.get('/productos/:idProducto',is_auth, adminController.getDetalleProducto);
router.post('/editar-producto',is_auth, adminController.postEditarProducto);
router.post('/eliminar-producto',is_auth, adminController.postEliminarProducto);

//Para las categorias
router.get('/categorias', adminController.getCategorias);
router.post('/crear-categoria', adminController.postCrearCategoria);
router.post('/editar-categoria', adminController.postEditarCategoria);
router.post('/eliminar-categoria', adminController.postEliminarCategoria);

//Para los desarrolladores
router.get('/desarrolladores', adminController.getDesarrolladores);
// router.get('/crear-desarrollador', adminController.getCrearDesarrollador);
router.post('/crear-desarrollador', adminController.postCrearDesarrollador);
// router.get('/editar-desarrollador/:idDesarrollador', adminController.getEditarDesarrollador);
router.post('/editar-desarrollador', adminController.postEditarDesarrollador);
router.post('/eliminar-desarrollador', adminController.postEliminarDesarrollador);

// //Para las plataformas
router.get('/plataformas', adminController.getPlataformas);
// router.get('/crear-plataforma', adminController.getCrearPlataforma);
router.post('/crear-plataforma', adminController.postCrearPlataforma);
//router.get('/editar-plataforma/:idPlataforma', adminController.getEditarPlataforma);
router.post('/editar-plataforma', adminController.postEditarPlataforma);
router.post('/eliminar-plataforma', adminController.postEliminarPlataforma);

// //Para el genero
router.get('/generos', adminController.getGeneros);
// router.get('/crear-genero', adminController.getCrearGenero);
router.post('/crear-genero', adminController.postCrearGenero);
// router.get('/editar-geneor/:idGenero', adminController.getEditarGenero);
router.post('/editar-genero', adminController.postEditarGenero);
router.post('/eliminar-genero', adminController.postEliminarGenero);

router.get('/pedidos', adminController.getPedidos)

module.exports = router;