const request = require('supertest');
const app = require('../../app');
const Usuario = require('../../models/usuario');
const bcrypt = require('bcryptjs');
const { usuarioValido } = require('../fixtures/usuarios');

// DESARROLLADO POR: JOEL ALBORNOZ Y JORGE AMAYA.

describe('Auth Controller', () => {
    let server;
    let csrfToken;
    let cookies;

    beforeAll(async () => {
        server = app.listen(3001);

        await Usuario.deleteMany({});

        // Obtener nuevo token CSRF para cada prueba
        const csrfResponse = await request(app)
            .get('/api/auth/csrf-token');

        if (!csrfResponse.headers['set-cookie']) {
            throw new Error('No se recibieron cookies del servidor');
        }

        // Guardar el token CSRF y las cookies¿
        cookies = csrfResponse.headers['set-cookie'];
        // Filtrar el header que contiene XSRF-TOKEN
        const xsrfHeader = csrfResponse.headers['set-cookie'].find(header => header.startsWith('XSRF-TOKEN='));

        // Extraer el valor del token
        csrfToken = xsrfHeader ? xsrfHeader.split('=')[1].split(';')[0] : null;

        console.log(csrfToken);
        console.log(cookies);
    });

    afterAll(async () => {
        await server.close();
    });

    

    describe('POST /api/auth/registro', () => {
        it('debería registrar un nuevo usuario', async () => {
            const response = await request(app)
                .post('/api/auth/registro')
                .set('Cookie', cookies)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    ...usuarioValido,
                    password: 'Test123!',
                    _csrf: csrfToken
                });
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('mensaje', 'Usuario creado exitosamente');
            expect(response.body.usuario).toHaveProperty('email', usuarioValido.email);

            
        });

        it('debería rechazar email duplicado', async () => {
            await Usuario.create({
                ...usuarioValido,
                password: await bcrypt.hash('Test123!', 12)
            });

            const response = await request(app)
                .post('/api/auth/registro')
                .set('Cookie', cookies)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    ...usuarioValido,
                    password: 'Test123!',
                    _csrf: csrfToken
                });
                console.log(response.body);
            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('mensaje', 'Error de validación');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            const hashedPassword = await bcrypt.hash('Test123!', 12);
            await Usuario.create({
                ...usuarioValido,
                password: hashedPassword
            });
        });

        it('debería autenticar un usuario válido', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .set('Cookie', cookies)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    email: usuarioValido.email,
                    password: 'Test123!',
                    _csrf: csrfToken
                });
            console.log(response.body);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('mensaje', 'Inicio de sesión exitoso');
            expect(response.headers['set-cookie']).toBeDefined();

            
        });

        it('debería rechazar credenciales inválidas', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .set('Cookie', cookies)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    email: usuarioValido.email,
                    password: 'contraseñaIncorrecta',
                    _csrf: csrfToken
                });
            console.log(response.body);
            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('mensaje', 'Email o contraseña incorrectos');
        });
    });

    describe('POST /api/auth/cerrar-sesion', () => {
        it('debería cerrar sesión correctamente', async () => {
            // Primero hacer login para tener una sesión válida
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .set('Cookie', cookies)
                .set('X-CSRF-Token', csrfToken)
                .send({
                    email: usuarioValido.email,
                    password: 'Test123!',
                    _csrf: csrfToken
                });

            const response = await request(app)
                .post('/api/auth/cerrar-sesion')
                .set('Cookie', cookies)
                .set('X-CSRF-Token', csrfToken)
                .send({ _csrf: csrfToken });
            console.log(response.body);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('mensaje', 'Sesión cerrada exitosamente');
        });
    });
}); 