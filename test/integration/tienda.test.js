const request = require('supertest');
const app = require('../../app');
const Producto = require('../../models/producto');
const Usuario = require('../../models/usuario');
const Categoria = require('../../models/categoria');
const bcrypt = require('bcryptjs');
const { productoValido } = require('../fixtures/productos');
const { usuarioValido } = require('../fixtures/usuarios');
const { categoriaValida } = require('../fixtures/categorias');
const { connect, disconnect, clearDatabase } = require('../helpers/db');

// DESARROLLADO POR: JOEL ALBORNOZ Y JORGE AMAYA.
describe('Tienda Controller', () => {
    let server;
    let csrfToken;
    let cookies;
    let usuario;
    let producto;
    let agent;

    beforeAll(async () => {
        server = app.listen(3003);
        // Crear usuario normal
        const hashedPassword = await bcrypt.hash('Test123!', 12);
        usuario = await Usuario.create({
            ...usuarioValido,
            password: hashedPassword,
            carrito: { items: [] }
        });
        

        // Obtener CSRF token inicial
        const csrfResponse = await request(app)
            .get('/api/auth/csrf-token');

        cookies = csrfResponse.headers['set-cookie'];
        const xsrfHeader = cookies.find(cookie => cookie.startsWith('XSRF-TOKEN='));
        csrfToken = xsrfHeader ? xsrfHeader.split('=')[1].split(';')[0] : null;

        // Login como usuario normal
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .set('Cookie', cookies)
            .set('X-CSRF-Token', csrfToken)
            .send({
                email: usuarioValido.email,
                password: 'Test123!',
                _csrf: csrfToken
            });

        console.log('Login response:', loginResponse.body);
        console.log('Session cookies:', cookies);
        console.log('CSRF Token:', csrfToken);
    });
    afterAll(async () => {
        await server.close();
    });
    beforeEach(async () => {
        await Producto.deleteMany({});
        // Crear producto con slug único
        producto = await Producto.create({
            ...productoValido,
            slug: `producto-test-${Date.now()}`,
            stock: 10
        });
    });
    describe('GET /api/tienda/productos', () => {
        it('debería obtener lista de productos', async () => {
            const response = await request(app)
                .get('/api/tienda/productos')
                .set('Cookie', cookies);

            console.log('Response status:', response.status);
            console.log('Response body:', response.body);
            
            expect(response.status).toBe(200);
            expect(response.body.productos).toBeInstanceOf(Array);
            expect(response.body.productos).toHaveLength(1);
        });
    });

    describe('GET /api/tienda/producto/:slug', () => {
        it('debería obtener detalle de un producto', async () => {
            const response = await request(app)
                .get(`/api/tienda/producto/${producto.slug}`)
                .set('Cookie', cookies);
            console.log(response.status);
            console.log(response.body);
            expect(response.status).toBe(200);
            expect(response.body.producto).toHaveProperty('nombre', productoValido.nombre);
        });
    });

    describe('GET /api/tienda/categorias', () => {
        beforeEach(async () => {
            await Categoria.create(categoriaValida);
        });

        it('debería obtener lista de categorías', async () => {
            const response = await request(app)
                .get('/api/tienda/categorias')
                .set('Cookie', cookies);

            expect(response.status).toBe(200);
            expect(response.body.categorias).toBeInstanceOf(Array);
            expect(response.body.categorias).toHaveLength(1);
        });
    });

    describe('GET /api/tienda/categoria/:slug', () => {
        beforeEach(async () => {
            const categoria = await Categoria.create(categoriaValida);
            await Producto.create({
                ...productoValido,
                idCategoria: categoria._id
            });
        });

        it('debería obtener productos por categoría', async () => {
            const response = await request(app)
                .get(`/api/tienda/categoria/${categoriaValida.slug}`)
                .set('Cookie', cookies);

            expect(response.status).toBe(200);
            expect(response.body.productos).toBeInstanceOf(Array);
            expect(response.body.productos).toHaveLength(1);
        });
    });
}); 