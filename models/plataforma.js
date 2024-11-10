const mongoose = require('mongoose');
const slugify = require('slugify')

const Schema = mongoose.Schema;

const plataformaSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    descripcion: {
        type: String
    }
});

plataformaSchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = slugify(`${this.nombre}`, { lower: true });
    }
    next();
});

module.exports = mongoose.model('Plataforma', plataformaSchema);
