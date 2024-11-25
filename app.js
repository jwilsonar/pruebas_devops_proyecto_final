const path = require('path');
const express = require('express');
const raizDir = require('./utils/path');
var session = require('express-session')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Usuario = require('./models/usuario');
const flash = require('connect-flash')

const MONGODB_URI = "mongodb+srv://a20200308:secreto@cluster0.4bkjl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const app = express();
const tiendaRoutes = require('./routes/tienda')
const adminRoutes = require('./routes/admin')
const errorController = require('./controllers/error')
const authRoutes = require('./routes/auth');
const multer = require('multer');
const MongoDBStore = require('connect-mongodb-session')(session)

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'imagenes');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb)=>{
    if(
        file.mimetype === 'image/png'||
        file.mimetype === 'image/jpg'||
        file.mimetype === 'image/jpeg'

    ){
        cb(null, true)
    }else{
        cb(null, false)
    }
}

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('imagen'));
app.use(express.static(path.join(raizDir, 'public')));
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})
app.use(session({ secret: 'valor secreto', resave: false, saveUninitialized: false, store: store }));
app.use(flash());
app.use((req, res, next) => {
    if (!req.session.usuarioId) {
        return next(); // Si no hay usuario en sesión, continúa
    }
    Usuario.findById(req.session.usuario._id)
        .then(usuario => {
            if (usuario) {
                req.session.usuario = usuario; // Recupera y asigna como instancia del modelo
            }
            next();
        })
        .catch(err => {
            console.error(err);
            next(); // Manejo básico de errores
        });
});
app.use(tiendaRoutes);
app.use('/admin',adminRoutes);
app.use(authRoutes);
app.use(errorController.get404);


mongoose
    .connect(
        MONGODB_URI
    )
    .then(result => {
        app.listen(3000);
    })
    .catch(err => {
    console.log(err);
});
