const bcrypt = require('bcryptjs');

const usuarioValido = {
    nombres: 'Test',
    apellidos: 'Usuario',
    email: 'test@test.com',
    password: bcrypt.hashSync('Test123!', 12),
    telefono: '123456789',
    tipoUsuario: 'user'
};

const adminValido = {
    ...usuarioValido,
    email: 'admin@test.com',
    tipoUsuario: 'admin'
};

module.exports = {
    usuarioValido,
    adminValido
}; 