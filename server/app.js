const express = require('express');
const path = require('path')
const app = express()
const cookieParser = require('cookie-parser');

//middlewares
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser());

//Rutitas
const authRoutes = require('../routes/authRoute');
const imageRoutes = require('../routes/imageRoute');
const albumRoutes = require('../routes/albumRoute');
const perfilRoutes = require('../routes/perfilRoute');
const muroRoutes = require("../routes/muroRoute");
const busquedaRoutes = require('../routes/busquedaRoute');

//Vistas
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '../views_pug'))



app.use('/', authRoutes);
app.use('/albums', imageRoutes);
app.use('/albums', albumRoutes);
app.use('/perfil', perfilRoutes);
app.use("/muro", muroRoutes) ;
app.use('/busqueda', busquedaRoutes);


//Error global pruebas de cloudinary
app.use((err, req, res, next) => {
  console.error('💥 Error capturado por el handler global:', err);
  // si es un error de multer o cloudinary
  if (err.name === 'MulterError' || err.http_code) {
    return res.status(500).send(err.message || JSON.stringify(err));
  }
  // cualquier otro error
  res.status(500).send(err.message || 'Error interno del servidor');
});


module.exports =app;
