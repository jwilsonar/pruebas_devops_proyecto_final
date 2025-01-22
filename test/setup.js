const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

beforeAll(async () => {
    // Configurar variables de entorno para pruebas
    process.env.NODE_ENV = 'test';
    process.env.SESSION_SECRET = 'test-secret';

    // Desconectar cualquier conexión existente
    await mongoose.disconnect();
    
    // Crear nueva instancia de MongoDB en memoria
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    await mongoose.connect(uri);
});

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    if (mongod) {
        await mongod.stop();
    }
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
}); 