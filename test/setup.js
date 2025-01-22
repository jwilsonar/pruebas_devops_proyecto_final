const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

beforeAll(async () => {
    // Desconectar cualquier conexión existente
    await mongoose.disconnect();
    
    // Crear nueva instancia de MongoDB en memoria
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    // Configurar mongoose
    const mongooseOpts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    // Conectar a la base de datos de prueba
    await mongoose.connect(uri, mongooseOpts);
    
    // Guardar la instancia globalmente
    global.__MONGOD__ = mongod;
});

afterAll(async () => {
    // Asegurarse de que la conexión esté cerrada
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    
    // Detener el servidor MongoDB en memoria
    if (mongod) {
        await mongod.stop();
    }
});

afterEach(async () => {
    // Limpiar todas las colecciones después de cada prueba
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
}); 