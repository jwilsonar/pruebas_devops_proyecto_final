const path = require('path');
const express = require('express');
const raizDir = require('./utils/path');

const app = express();
const tiendaRoutes = require('./routes/tienda')

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(raizDir, 'public')));

app.use(tiendaRoutes);

app.listen(3000,()=>{
    console.log("Servidor corriendo en el puerto 3000")
})
