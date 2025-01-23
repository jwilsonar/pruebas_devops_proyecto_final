const csrf = require('csurf');

const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
});

// Middleware para manejar errores CSRF
const handleCsrfError = (err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') return next(err);
    console.error('Error CSRF:', err);
    res.status(403).json({
        mensaje: 'Token CSRF inválido o expirado'
    });
};

// Middleware para agregar el token CSRF a la respuesta
const setCsrfToken = (req, res, next) => {
    try {
        const token = req.csrfToken();
        res.cookie('XSRF-TOKEN', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        next();
    } catch (error) {
        console.error('Error al establecer token CSRF:', error);
        next(error);
    }
};

module.exports = {
    csrfProtection,
    handleCsrfError,
    setCsrfToken
}; 