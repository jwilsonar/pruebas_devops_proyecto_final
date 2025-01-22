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

    beforeAll(() => {
        server = app.listen(3001);
    });

    afterAll(done => {
        server.close(done);
    });

    beforeEach(async () => {
        await Usuario.deleteMany({});

        // Obtener el token CSRF y las cookies
        const response = await request(app)
            .get('/api/auth/csrf-token');
        
        csrfToken = response.body.csrfToken;
        cookies = response.headers['set-cookie'].map(cookie => 
            cookie.split(';')[0]
        ).join('; ');
    });

    describe('POST /api/auth/registro', () => {
        it('debería registrar un nuevo usuario', async () => {
            const response = await request(app)
                .post('/api/auth/registro')
                .set('Cookie', cookies)
                .send({
                    ...usuarioValido,
                    _csrf: csrfToken
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('mensaje', 'Usuario creado exitosamente');
            expect(response.body.usuario).toHaveProperty('email', usuarioValido.email);
        });

        it('debería rechazar email duplicado', async () => {
            await Usuario.create({
                ...usuarioValido,
                password: await bcrypt.hash(usuarioValido.password, 12)
            });

            const response = await request(app)
                .post('/api/auth/registro')
                .set('Cookie', cookies)
                .send({
                    ...usuarioValido,
                    _csrf: csrfToken
                });

            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('mensaje', 'El email ya está registrado');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await Usuario.create({
                ...usuarioValido,
                password: await bcrypt.hash(usuarioValido.password, 12)
            });
        });

        it('debería autenticar un usuario válido', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .set('Cookie', cookies)
                .send({
                    email: usuarioValido.email,
                    password: usuarioValido.password,
                    _csrf: csrfToken
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('mensaje', 'Inicio de sesión exitoso');
            expect(response.body.usuario).toHaveProperty('email', usuarioValido.email);
            expect(response.headers['set-cookie']).toBeDefined();
        });

        it('debería rechazar credenciales inválidas', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .set('Cookie', cookies)
                .send({
                    email: usuarioValido.email,
                    password: 'contraseñaIncorrecta',
                    _csrf: csrfToken
                });

            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('mensaje', 'Email o contraseña incorrectos');
        });
    });

    describe('POST /api/auth/cerrar-sesion', () => {
        it('debería cerrar sesión correctamente', async () => {
            // Primero iniciamos sesión
            await request(app)
                .post('/api/auth/login')
                .set('Cookie', cookies)
                .send({
                    email: usuarioValido.email,
                    password: usuarioValido.password,
                    _csrf: csrfToken
                });

            const response = await request(app)
                .post('/api/auth/cerrar-sesion')
                .set('Cookie', cookies)
                .send({ _csrf: csrfToken });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('mensaje', 'Sesión cerrada exitosamente');
        });
    });
}); 