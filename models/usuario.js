const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
    nombres: {
        type: String,
        required: [true, 'El nombre es requerido']
    },
    apellidos: {
        type: String,
        required: [true, 'Los apellidos son requeridos']
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Por favor ingrese un email válido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    telefono: {
        type: String,
        required: [true, 'El teléfono es requerido'],
        validate: {
            validator: function(v) {
                return /^\d{9}$/.test(v);
            },
            message: 'El teléfono debe tener 9 dígitos numéricos'
        }
    },
    tipoUsuario: {
        type: String,
        required: true,
        enum: ['user', 'admin'],
        default: 'user'
    },
    carrito: {
        items: [{
            idProducto: {
                type: Schema.Types.ObjectId,
                ref: 'Producto',
                required: true
            },
            cantidad: {
                type: Number,
                required: true
            }
        }]
    }
});

// Métodos del carrito
usuarioSchema.methods.agregarAlCarrito = function(producto) {
    const indiceProductoCarrito = this.carrito.items.findIndex(cp => {
        return cp.idProducto.toString() === producto._id.toString();
    });

    let nuevaCantidad = 1;
    const itemsCarritoActualizados = [...this.carrito.items];

    if (indiceProductoCarrito >= 0) {
        nuevaCantidad = this.carrito.items[indiceProductoCarrito].cantidad + 1;
        itemsCarritoActualizados[indiceProductoCarrito].cantidad = nuevaCantidad;
    } else {
        itemsCarritoActualizados.push({
            idProducto: producto._id,
            cantidad: nuevaCantidad
        });
    }

    this.carrito = {
        items: itemsCarritoActualizados
    };

    return this.save();
};

usuarioSchema.methods.deleteItemDelCarrito = function(productoId) {
    const itemsCarritoActualizados = this.carrito.items.filter(item => {
        return item.idProducto.toString() !== productoId.toString();
    });
    this.carrito.items = itemsCarritoActualizados;
    return this.save();
};

usuarioSchema.methods.limpiarCarrito = function() {
    this.carrito = { items: [] };
    return this.save();
};

module.exports = mongoose.model('Usuario', usuarioSchema);
