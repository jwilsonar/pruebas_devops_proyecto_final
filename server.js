require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

let server;

if (process.env.NODE_ENV !== 'test') {
    mongoose
        .connect(MONGODB_URI)
        .then(() => {
            server = app.listen(PORT);
            console.log(`Servidor iniciado en puerto ${PORT}`);
        })
        .catch(err => {
            console.log(err);
        });
}

// Manejar el cierre gracioso del servidor
process.on('SIGTERM', () => {
    console.log('SIGTERM recibido. Cerrando servidor...');
    if (server) {
        server.close(() => {
            console.log('Servidor cerrado.');
            mongoose.connection.close(false, () => {
                console.log('Conexión MongoDB cerrada.');
                process.exit(0);
            });
        });
    }
});

module.exports = server; 