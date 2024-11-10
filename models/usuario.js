const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
    nombres: {
        type: String,
        required: true
    },
    apellidos: {
        type: String,
        required: true
    },
    tipoUsuario: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    carrito: {
        items: [
            {
                idProducto: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
                cantidad: { type: Number, required: true }
            }
        ]
    },
    historialCompras: [{
        type: Schema.Types.ObjectId,
        ref: 'Pedido'
    }],
    listaDeseos: {
        items: [
            {
                idProducto: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
            }
        ]
    }
});

// Métodos para el carrito
usuarioSchema.methods.agregarAlCarrito = function(producto) {
    if (!this.carrito) {
        this.carrito = {items: []};
    }
    const indiceEnCarrito = this.carrito.items.findIndex(cp => {
        return cp.idProducto.toString() === producto._id.toString();
    });
    let nuevaCantidad = 1;
    const itemsActualizados = [...this.carrito.items];

    if (indiceEnCarrito >= 0) {
        nuevaCantidad = this.carrito.items[indiceEnCarrito].cantidad + 1;
        itemsActualizados[indiceEnCarrito].cantidad = nuevaCantidad;
    } else {
        itemsActualizados.push({
            idProducto: producto._id,
            cantidad: nuevaCantidad
        });
    }
    const carritoActualizado = {
        items: itemsActualizados
    };

    this.carrito = carritoActualizado;
    return this.save();
};

usuarioSchema.methods.deleteItemDelCarrito = function(idProducto) {
    const itemsActualizados = this.carrito.items.filter(item => {
        return item.idProducto.toString() !== idProducto.toString();
    });
    this.carrito.items = itemsActualizados;
    return this.save();
};

usuarioSchema.methods.limpiarCarrito = function() {
    this.carrito = { items: [] };
    return this.save();
};

// Métodos para la lista de deseos
usuarioSchema.methods.agregarAlistaDeseos = function(producto) {
    if (!this.listaDeseos) {
        this.listaDeseos = { items: [] };
    }

    // Verifica si el producto ya está en la lista de deseos
    const existeEnLista = this.listaDeseos.items.some(item => item.idProducto.toString() === producto._id.toString());

    if (existeEnLista) {
        return Promise.resolve();  // No hace nada si ya está en la lista
    }

    this.listaDeseos.items.push({
        idProducto: producto._id
    });

    return this.save();
};

usuarioSchema.methods.eliminarDeListaDeseos = function(idProducto) {
    this.listaDeseos.items = this.listaDeseos.items.filter(item => item.idProducto.toString() !== idProducto.toString());
    return this.save();
};

usuarioSchema.methods.limpiarListaDeseos = function() {
    this.listaDeseos = { items: [] };
    return this.save();
};

module.exports = mongoose.model('Usuario', usuarioSchema);
