const path = require('path');
const express = require('express');
const raizDir = require('./utils/path');
const bodyParser = require('body-parser')

const app = express();
const tiendaRoutes = require('./routes/tienda')
const adminRoutes = require('./routes/admin')
const errorController = require('./controllers/error')

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(raizDir, 'public')));

app.use(tiendaRoutes);
app.use('/admin',adminRoutes);
app.use(errorController.get404);

app.listen(3000,()=>{
    console.log("Servidor corriendo en el puerto 3000")
})
