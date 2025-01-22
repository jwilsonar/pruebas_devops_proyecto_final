const request = require('supertest');
const app = require('../../app');
const Usuario = require('../../models/usuario');
const { usuarioValido } = require('../fixtures/usuarios');

describe('Auth Controller', () => {
    let server;

    beforeAll(() => {
        server = app.listen(3001);
    });

    afterAll(done => {
        server.close(done);
    });

    beforeEach(async () => {
        await Usuario.deleteMany({});
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await Usuario.create(usuarioValido);
        });

        it('debería autenticar un usuario válido', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: usuarioValido.email,
                    password: 'Test123!'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('usuario');
            expect(response.body.usuario).toHaveProperty('email', usuarioValido.email);
            expect(response.body.usuario).toHaveProperty('tipoUsuario');
        });

        it('debería rechazar email inválido', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'noexiste@test.com',
                    password: 'Test123!'
                });

            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('mensaje');
        });

        it('debería rechazar contraseña incorrecta', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: usuarioValido.email,
                    password: 'ContraseñaIncorrecta123!'
                });

            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('mensaje');
        });

        it('debería validar formato de email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'emailinvalido',
                    password: 'Test123!'
                });

            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('mensaje');
        });
    });

    describe('POST /api/auth/registro', () => {
        const nuevoUsuario = {
            nombres: 'Test',
            apellidos: 'Usuario',
            email: 'nuevo@test.com',
            password: 'Test123!',
            passwordConfirm: 'Test123!',
            telefono: '123456789',
            tipoUsuario: 'user'
        };

        it('debería registrar un nuevo usuario', async () => {
            const response = await request(app)
                .post('/api/auth/registro')
                .send(nuevoUsuario);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('mensaje', 'Usuario creado exitosamente');
            expect(response.body.usuario).toHaveProperty('email', nuevoUsuario.email);

            // Verificar que el usuario fue creado en la base de datos
            const usuarioCreado = await Usuario.findOne({ email: nuevoUsuario.email });
            expect(usuarioCreado).toBeTruthy();
            expect(usuarioCreado.email).toBe(nuevoUsuario.email);
        });

        it('debería rechazar registro con email existente', async () => {
            await Usuario.create(usuarioValido);

            const response = await request(app)
                .post('/api/auth/registro')
                .send({
                    ...nuevoUsuario,
                    email: usuarioValido.email
                });

            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('mensaje');
        });

        it('debería validar formato de teléfono', async () => {
            const response = await request(app)
                .post('/api/auth/registro')
                .send({
                    ...nuevoUsuario,
                    telefono: '123' // teléfono inválido
                });

            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('mensaje');
        });
    });

    describe('POST /api/auth/cerrar-sesion', () => {
        it('debería cerrar la sesión del usuario', async () => {
            const response = await request(app)
                .post('/api/auth/cerrar-sesion');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('mensaje', 'Sesión cerrada exitosamente');
        });
    });
}); 