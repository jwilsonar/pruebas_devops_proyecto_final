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
    fechaFundacion: Date,
    descripcion: String,
    juegosDesarrollados: [{
        type: Schema.Types.ObjectId,
        ref: 'Producto'
    }]
});

desarrolladorSchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = slugify(`${this.nombre}`, { lower: true });
    }
    next();
});

module.exports = mongoose.model('Desarrollador', desarrolladorSchema);
