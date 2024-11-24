const mongoose = require('mongoose');
const slugify = require('slugify')

const Schema = mongoose.Schema;

const generoSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    imagen:{
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    descripcion: String
});

// Middleware para generar el slug antes de la validación
generoSchema.pre('validate', function (next) {
    if (!this.slug && this.nombre) {
        this.slug = slugify(this.nombre, { lower: true });
    }
    next();
});

module.exports = mongoose.model('Genero', generoSchema);
