const mongoose = require('mongoose');
const slugify = require('slugify')

const Schema = mongoose.Schema;

const categoriaSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    descripcion: {
        type: String
    },
    imagen:{
        type: String
    },
    slug: {
        type: String,
        required: true,
        unique: true
    }
});

categoriaSchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = slugify(`${this.nombre}`, { lower: true });
    }
    next();
});

module.exports = mongoose.model('Categoria', categoriaSchema);
