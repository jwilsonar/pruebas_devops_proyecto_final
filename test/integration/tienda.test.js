const request = require('supertest');
const app = require('../../app');
const Producto = require('../../models/producto');
const Usuario = require('../../models/usuario');
const Categoria = require('../../models/categoria');
const { productoValido } = require('../fixtures/productos');
const { usuarioValido } = require('../fixtures/usuarios');
const { categoriaValida } = require('../fixtures/categorias');

describe('Tienda Controller', () => {
    let server;
    let cookie;

    beforeAll(() => {
        server = app.listen(3003);
    });

    afterAll(done => {
        server.close(done);
    });

    beforeEach(async () => {
        await Producto.deleteMany({});
        await Usuario.deleteMany({});
        await Categoria.deleteMany({});

        // Crear usuario y autenticar
        await Usuario.create(usuarioValido);
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: usuarioValido.email,
                password: 'Test123!'
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
    });

    describe('GET /api/tienda/producto/:slug', () => {
        beforeEach(async () => {
            await Producto.create(productoValido);
        });

        it('debería obtener detalle de un producto', async () => {
            const response = await request(app)
                .get(`/api/tienda/producto/${productoValido.slug}`);

            expect(response.status).toBe(200);
            expect(response.body.producto).toHaveProperty('nombre', productoValido.nombre);
        });
    });

    describe('GET /api/tienda/carrito', () => {
        it('debería obtener el carrito del usuario', async () => {
            const response = await request(app)
                .get('/api/tienda/carrito')
                .set('Cookie', cookie);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('carrito');
            expect(response.body.carrito).toHaveProperty('productos');
            expect(response.body.carrito).toHaveProperty('precioTotal');
        });

        it('debería requerir autenticación', async () => {
            const response = await request(app)
                .get('/api/tienda/carrito');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/tienda/carrito', () => {
        let producto;

        beforeEach(async () => {
            producto = await Producto.create(productoValido);
        });

        it('debería agregar producto al carrito', async () => {
            const response = await request(app)
                .post('/api/tienda/carrito')
                .set('Cookie', cookie)
                .send({
                    idProducto: producto._id
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('mensaje', 'Producto agregado al carrito');
            expect(response.body).toHaveProperty('carrito');
        });

        it('debería validar stock disponible', async () => {
            await Producto.findByIdAndUpdate(producto._id, { stock: 0 });

            const response = await request(app)
                .post('/api/tienda/carrito')
                .set('Cookie', cookie)
                .send({
                    idProducto: producto._id
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('mensaje', 'Stock insuficiente');
        });
    });

    describe('POST /api/tienda/carrito-eliminar-item', () => {
        let producto;

        beforeEach(async () => {
            producto = await Producto.create(productoValido);
            await request(app)
                .post('/api/tienda/carrito')
                .set('Cookie', cookie)
                .send({
                    idProducto: producto._id
                });
        });

        it('debería eliminar producto del carrito', async () => {
            const response = await request(app)
                .post('/api/tienda/carrito-eliminar-item')
                .set('Cookie', cookie)
                .send({
                    idProducto: producto._id
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('mensaje', 'Producto eliminado del carrito');
        });
    });

    describe('GET /api/tienda/categorias', () => {
        beforeEach(async () => {
            await Categoria.create(categoriaValida);
        });

        it('debería obtener lista de categorías', async () => {
            const response = await request(app)
                .get('/api/tienda/categorias');

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
                .get(`/api/tienda/categoria/${categoriaValida.slug}`);

            expect(response.status).toBe(200);
            expect(response.body.productos).toBeInstanceOf(Array);
            expect(response.body.productos).toHaveLength(1);
        });
    });
}); 