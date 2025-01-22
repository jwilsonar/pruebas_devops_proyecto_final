require('dotenv').config();
const path = require('path');
const express = require('express');
const raizDir = require('./utils/path');
var session = require('express-session')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Usuario = require('./models/usuario');
const flash = require('connect-flash')
const multer = require('multer');
const MongoDBStore = require('connect-mongodb-session')(session)

const MONGODB_URI = process.env.MONGODB_URI;

const app = express();
const tiendaRoutes = require('./routes/tienda')
const adminRoutes = require('./routes/admin')
const errorController = require('./controllers/error')
const authRoutes = require('./routes/auth');

// Configuración de CORS (debe ir primero)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Configuración de multer
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'imagenes');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

// Configuración básica
app.set('view engine', 'ejs');
app.set('views', 'views');

// Middlewares de parseo (deben ir antes de las rutas)
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('imagen'));

// Archivos estáticos
app.use(express.static(path.join(raizDir, 'public')));
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

// Configuración de sesión
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})

app.use(session({
    secret: 'valor secreto',
    resave: false,
    saveUninitialized: false,
    store: store
}));

app.use(flash());

// Middleware de usuario
app.use(async (req, res, next) => {
    if (!req.session.usuario) {
        return next();
    }
    try {
        const usuario = await Usuario.findById(req.session.usuario._id);
        if (usuario) {
            req.usuario = usuario;
        }
        next();
    } catch (err) {
        next(err);
    }
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/tienda', tiendaRoutes);
app.use('/api/admin', adminRoutes);

// Manejo de errores - debe ir después de todas las rutas
app.use((req, res) => {
    res.status(404).json({
        mensaje: 'Ruta no encontrada'
    });
});

app.use((error, req, res, next) => {
    console.error(error);
    res.status(error.httpStatusCode || 500).json({
        mensaje: error.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : {}
    });
});

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conexión a MongoDB establecida');
}).catch(err => {
    console.error('Error al conectar a MongoDB:', err);
});

module.exports = app;
