const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async function globalTeardown() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
    
    // Asegurarse de que todas las conexiones se cierren correctamente
    const mongod = global.__MONGOD__;
    if (mongod) {
        await mongod.stop();
    }
}; 