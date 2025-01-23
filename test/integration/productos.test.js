const request = require('supertest');
const app = require('../../app');
const Producto = require('../../models/producto');
const Usuario = require('../../models/usuario');
const { productoValido } = require('../fixtures/productos');
const { adminValido } = require('../fixtures/usuarios');
const bcrypt = require('bcryptjs');
const { connect, disconnect, clearDatabase } = require('../helpers/db');

// DESARROLLADO POR: YOURI GAMBOA Y ANGELES TASAYCO

describe('Productos Controller', () => {
    let server;
    let csrfToken;
    let cookies;
    let admin;
    let agent;

    beforeAll(async () => {
        server = app.listen(3002);

        // Crear admin
        const hashedPassword = await bcrypt.hash('Admin123!', 12);
        admin = await Usuario.create({
            ...adminValido,
            password: hashedPassword
        });

        // Obtener CSRF token inicial
        const csrfResponse = await request(app)
            .get('/api/auth/csrf-token');

        cookies = csrfResponse.headers['set-cookie'];
        const xsrfHeader = cookies.find(cookie => cookie.startsWith('XSRF-TOKEN='));
        csrfToken = xsrfHeader ? xsrfHeader.split('=')[1].split(';')[0] : null;

        // Login como admin
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .set('Cookie', cookies)
            .set('X-CSRF-Token', csrfToken)
            .send({
                email: adminValido.email,
                password: 'Admin123!',
                _csrf: csrfToken
            });

        console.log('Admin login response:', loginResponse.body);
        console.log('Session cookies:', cookies);
        console.log('CSRF Token:', csrfToken);
    });

    afterAll(async () => {
        await server.close();
    });

    describe('GET /api/tienda/productos', () => {
        beforeEach(async () => {
            await Producto.create(productoValido);
        });

        it('debería obtener lista de productos', async () => {
            const response = await request(app)
                .get('/api/tienda/productos');
            console.log('Productos response:', response.body);
            expect(response.status).toBe(200);
            expect(response.body.productos).toBeInstanceOf(Array);
            expect(response.body.productos).toHaveLength(1);
        });

        it('debería filtrar productos por categoría', async () => {
            const response = await request(app)
                .get('/api/tienda/productos')
                .query({ categoria: productoValido.idCategoria });

            console.log('Productos response:', response.body);
            expect(response.status).toBe(200);
            expect(response.body.productos).toBeInstanceOf(Array);
        });
    });

}); 