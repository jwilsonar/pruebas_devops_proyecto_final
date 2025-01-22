const request = require('supertest');
const app = require('../../app');
const Producto = require('../../models/producto');
const { productoValido } = require('../fixtures/productos');
const { crearSesionAdmin } = require('../helpers/auth');
const path = require('path');
const Usuario = require('../../models/usuario');
const bcrypt = require('bcrypt');

// DESARROLLADO POR: YOURI GAMBOA Y ANGELES TASAYCO

describe('Productos Controller', () => {
    let server;
    let csrfToken;
    let cookie;

    beforeAll(() => {
        server = app.listen(3002);
    });

    afterAll(done => {
        server.close(done);
    });

    beforeEach(async () => {
        await Producto.deleteMany({});
        await Usuario.deleteMany({});

        // Obtener el token CSRF
        const response = await request(app)
            .get('/api/auth/csrf-token');
        csrfToken = response.body.csrfToken;
        cookie = response.headers['set-cookie'];

        // Crear usuario administrador y autenticar
        const admin = await Usuario.create({
            nombres: 'Admin',
            apellidos: 'Test',
            email: 'admin@test.com',
            password: await bcrypt.hash('Admin123!', 12),
            telefono: '123456789',
            tipoUsuario: 'admin'
        });

        const loginResponse = await request(app)
            .post('/api/auth/login')
            .set('Cookie', cookie)
            .send({
                email: admin.email,
                password: 'Admin123!',
                _csrf: csrfToken
            });

        cookie = loginResponse.headers['set-cookie'];
    });

    describe('GET /api/tienda/productos', () => {
        beforeEach(async () => {
            await Producto.create(productoValido);
        });

        it('debería obtener lista de productos', async () => {
            const response = await request(app)
                .get('/api/tienda/productos');

            expect(response.status).toBe(200);
            expect(response.body.productos).toBeInstanceOf(Array);
            expect(response.body.productos).toHaveLength(1);
        });

        it('debería filtrar productos por categoría', async () => {
            const response = await request(app)
                .get('/api/tienda/productos')
                .query({ categoria: productoValido.categoria });

            expect(response.status).toBe(200);
            expect(response.body.productos).toBeInstanceOf(Array);
        });
    });
}); 