const Usuario = require('../../models/usuario');
const bcrypt = require('bcryptjs');
const request = require('supertest');
const app = require('../../app');

const crearSesionAdmin = async () => {
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const admin = await Usuario.create({
        nombres: 'Admin',
        apellidos: 'Test',
        email: 'admin@test.com',
        password: adminPassword,
        telefono: '123456789',
        tipoUsuario: 'admin'
    });

    return admin._id;
};

async function obtenerTokenYCookies() {
    const csrfResponse = await request(app)
        .get('/api/auth/csrf-token');
    
    if (!csrfResponse.headers['set-cookie']) {
        throw new Error('No se recibieron cookies del servidor');
    }

    return {
        csrfToken: csrfResponse.body.csrfToken,
        cookies: csrfResponse.headers['set-cookie'].map(cookie => 
            cookie.split(';')[0]
        ).join('; ')
    };
}

async function autenticarUsuario(email, password, cookiesIniciales, csrfToken) {
    const loginResponse = await request(app)
        .post('/api/auth/login')
        .set('Cookie', cookiesIniciales)
        .send({
            email,
            password,
            _csrf: csrfToken
        });

    if (!loginResponse.headers['set-cookie']) {
        // En lugar de lanzar un error, devolvemos las cookies originales
        return cookiesIniciales;
    }

    const nuevasCookies = loginResponse.headers['set-cookie'].map(cookie => 
        cookie.split(';')[0]
    ).join('; ');

    // Combinar cookies antiguas y nuevas
    return `${cookiesIniciales}; ${nuevasCookies}`;
}

module.exports = {
    crearSesionAdmin,
    obtenerTokenYCookies,
    autenticarUsuario
}; 