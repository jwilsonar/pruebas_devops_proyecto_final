const mongoose = require('mongoose');
const slugify = require('slugify');

const Schema = mongoose.Schema;

const productoSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    precioDescuento: {
        type: Number
    },
    estado: {
        type: String,
        enum: ['activo', 'inactivo', 'agotado'],
        default: 'activo'
    },
    stock: {
        type: Number,
        required: true
    },
    limiteCompra: {
        type: Number,
        default: 10
    },
    unidadMedida: {
        type: String,
        default: 'unidad'
    },
    categoria: {
        idCategoria: { type: Schema.Types.ObjectId, ref: 'Categoria', required: true },
    },
    marca: {
        type: String
    },
    tags: [String],
    imagenes: [{
        type: String
    }],
    imagen_portada: {
        type: String,
        required: true
    },
    metaTitulo: {
        type: String
    },
    metaDescripcion: {
        type: String
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
    publicado: {
        type: Boolean,
        default: true
    },
    valoracion: {
        type: Number,
        default: 0
    },
    desarrollador:{
        idDesarrollador: {type: Schema.Types.ObjectId, ref: 'Desarrollador', required: true}
    },
    plataforma:{
        idPlataforma: {type: Schema.Types.ObjectId, ref: 'Plataforma', required: true}
    },
    genero:{
        idGenero: {type: Schema.Types.ObjectId, ref: 'Genero', required: true}
    },
    cantidadVentas: {
        type: Number,
        default: 0
    },
    esDestacado: {
        type: Boolean,
        default: false
    },
    fechaDescuento: {
        inicio: { type: Date },
        fin: { type: Date }
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    fechaActualizacion: {
        type: Date,
        default: Date.now
    },
    idUsuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
});

productoSchema.pre('save', function(next) {
    this.fechaActualizacion = Date.now();
    next();
});

productoSchema.pre('save', function(next) {
    if (!this.slug) {
        const developer = this.idDesarrollador ? this.idDesarrollador : "desarrollador-desconocido";
        this.slug = slugify(`${this.nombre}-${developer}`, { lower: true });
    }
    next();
});


module.exports = mongoose.model('Producto', productoSchema);
