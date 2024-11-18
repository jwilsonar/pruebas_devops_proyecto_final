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
const authRoutes = require('./routes/auth')
const MongoDBStore = require('connect-mongodb-session')(session)

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(raizDir, 'public')));

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})
app.use(session({secret:'valor secreto', resave:false, saveUnitialized: false, store: store}))
app.use(flash());
console.log("Hello world");
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
