const request = require('supertest');
const app = require('../../app');
const Producto = require('../../models/producto');
const Usuario = require('../../models/usuario');
const Categoria = require('../../models/categoria');
const bcrypt = require('bcryptjs');
const { productoValido } = require('../fixtures/productos');
const { usuarioValido } = require('../fixtures/usuarios');
const { categoriaValida } = require('../fixtures/categorias');

// DESARROLLADO POR: JOEL ALBORNOZ Y JORGE AMAYA.
describe('Tienda Controller', () => {
    let server;
    let csrfToken;
    let cookies;
    let usuario;
    let producto;

    beforeAll(() => {
        server = app.listen(3003);
    });

    afterAll(done => {
        server.close(done);
    });

    beforeEach(async () => {
        // Limpiar base de datos
        await Producto.deleteMany({});
        await Usuario.deleteMany({});
        await Categoria.deleteMany({});

        // Crear usuario con contraseña hasheada
        const hashedPassword = await bcrypt.hash('Test123!', 12);
        usuario = await Usuario.create({
            ...usuarioValido,
            password: hashedPassword,
            carrito: { items: [] }
        });

        // Crear producto de prueba
        producto = await Producto.create({
            ...productoValido,
            stock: 10
        });

        // Obtener token CSRF y cookies iniciales
        const csrfResponse = await request(app)
            .get('/api/auth/csrf-token');
        
        if (!csrfResponse.headers['set-cookie']) {
            throw new Error('No se recibieron cookies del servidor');
        }

        csrfToken = csrfResponse.body.csrfToken;
        cookies = csrfResponse.headers['set-cookie'].map(cookie => 
            cookie.split(';')[0]
        ).join('; ');

        // Iniciar sesión
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .set('Cookie', cookies)
            .send({
                email: usuarioValido.email,
                password: 'Test123!',
                _csrf: csrfToken
            });

        if (loginResponse.headers['set-cookie']) {
            cookies = loginResponse.headers['set-cookie'].map(cookie => 
                cookie.split(';')[0]
            ).join('; ');
        } else {
            throw new Error('No se recibieron cookies de sesión');
        }
    });

    describe('GET /api/tienda/productos', () => {
        beforeEach(async () => {
            await Producto.create(productoValido);
        });

        it('debería obtener lista de productos', async () => {
            const response = await request(app)
                .get('/api/tienda/productos')
                .set('Cookie', cookies);

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
                .get(`/api/tienda/producto/${productoValido.slug}`)
                .set('Cookie', cookies);

            expect(response.status).toBe(200);
            expect(response.body.producto).toHaveProperty('nombre', productoValido.nombre);
        });
    });

    describe('GET /api/tienda/carrito', () => {
        it('debería obtener el carrito vacío', async () => {
            const response = await request(app)
                .get('/api/tienda/carrito')
                .set('Cookie', cookies);

            expect(response.status).toBe(200);
            expect(response.body.carrito).toHaveProperty('productos');
            expect(response.body.carrito.productos).toHaveLength(0);
            expect(response.body.carrito.precioTotal).toBe('0.00');
        });

        it('debería obtener el carrito con productos', async () => {
            await usuario.agregarAlCarrito(producto, 2);

            const response = await request(app)
                .get('/api/tienda/carrito')
                .set('Cookie', cookies);

            expect(response.status).toBe(200);
            expect(response.body.carrito.productos).toHaveLength(1);
            expect(response.body.carrito.productos[0].cantidad).toBe(2);
            expect(parseFloat(response.body.carrito.precioTotal)).toBeGreaterThan(0);
        });
    });

    describe('POST /api/tienda/carrito', () => {
        it('debería agregar producto al carrito', async () => {
            const response = await request(app)
                .post('/api/tienda/carrito')
                .set('Cookie', cookies)
                .send({
                    idProducto: producto._id,
                    cantidad: 2,
                    _csrf: csrfToken
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('mensaje', 'Producto agregado al carrito');
            
            const usuarioActualizado = await Usuario.findById(usuario._id)
                .populate('carrito.items.idProducto');
            expect(usuarioActualizado.carrito.items).toHaveLength(1);
            expect(usuarioActualizado.carrito.items[0].cantidad).toBe(2);
        });

        it('debería actualizar cantidad si el producto ya está en el carrito', async () => {
            // Primero agregamos el producto
            await usuario.agregarAlCarrito(producto, 1);

            const response = await request(app)
                .post('/api/tienda/carrito')
                .set('Cookie', cookies)
                .send({
                    idProducto: producto._id,
                    cantidad: 1,
                    _csrf: csrfToken
                });

            expect(response.status).toBe(200);
            
            const usuarioActualizado = await Usuario.findById(usuario._id)
                .populate('carrito.items.idProducto');
            expect(usuarioActualizado.carrito.items).toHaveLength(1);
            expect(usuarioActualizado.carrito.items[0].cantidad).toBe(2);
        });

        it('debería validar stock disponible', async () => {
            const response = await request(app)
                .post('/api/tienda/carrito')
                .set('Cookie', cookies)
                .send({
                    idProducto: producto._id,
                    cantidad: 20,
                    _csrf: csrfToken
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('mensaje', 'Stock insuficiente');
        });
    });

    describe('POST /api/tienda/carrito-eliminar-item', () => {
        beforeEach(async () => {
            await usuario.agregarAlCarrito(producto, 1);
        });

        it('debería eliminar producto del carrito', async () => {
            const response = await request(app)
                .post('/api/tienda/carrito-eliminar-item')
                .set('Cookie', cookies)
                .send({
                    idProducto: producto._id,
                    _csrf: csrfToken
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('mensaje', 'Producto eliminado del carrito');

            const usuarioActualizado = await Usuario.findById(usuario._id);
            expect(usuarioActualizado.carrito.items).toHaveLength(0);
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