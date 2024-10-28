const path = require('path');
const express = require('express');
const raizDir = require('./utils/path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Usuario = require('./models/usuario');

const app = express();
const tiendaRoutes = require('./routes/tienda')
const adminRoutes = require('./routes/admin')
const errorController = require('./controllers/error')

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(raizDir, 'public')));

app.use((req, res, next) => {
    Usuario.find().then(usuarios =>{
        console.log(usuarios)
    })
    Usuario.findById('67201d6e76dacb7b50f1e68c')
        .then(usuario => {
        req.usuario = usuario;
        next();
    })
        .catch(err => console.log(err));
});

app.use(tiendaRoutes);
app.use('/admin',adminRoutes);
app.use(errorController.get404);

mongoose
    .connect(
        "mongodb+srv://a20200308:secreto@cluster0.4bkjl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    )
    .then(result => {
    Usuario.findOne().then(usuario => {
        if (!usuario) {
        const usuario = new Usuario({
            nombre: 'Admin',
            email: 'admin@gmail.com',
            carrito: {
            items: []
            }
        });
        usuario.save();
        }
    });
    app.listen(3000);
    })
    .catch(err => {
    console.log(err);
});
