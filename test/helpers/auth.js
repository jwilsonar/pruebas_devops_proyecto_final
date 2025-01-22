const Usuario = require('../../models/usuario');
const bcrypt = require('bcryptjs');

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

module.exports = {
    crearSesionAdmin
}; 