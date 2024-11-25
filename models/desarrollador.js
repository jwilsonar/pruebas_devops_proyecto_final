const mongoose = require('mongoose');
const slugify = require('slugify')

const Schema = mongoose.Schema;

const desarrolladorSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    pais: {
        type: String,
        required: true
    },
    imagen: {
        type: String,
    },
    slug: {
        type: String,
    },
    fechaFundacion: Date,
    descripcion: String,
    juegosDesarrollados: [{
        type: Schema.Types.ObjectId,
        ref: 'Producto'
    }]
});

// Middleware para generar el slug antes de la validación
desarrolladorSchema.pre('validate', function (next) {
    if (!this.slug && this.nombre) {
        this.slug = slugify(this.nombre, { lower: true });
    }
    next();
});

module.exports = mongoose.model('Desarrollador', desarrolladorSchema);
