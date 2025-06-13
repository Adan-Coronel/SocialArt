const express = require('express');
const path = require('path')
const app = express()
const cookieParser = require('cookie-parser');

//middlewares
app.use(express.json())
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
const friendRoutes = require("../routes/friendReqRoute");
const commentRoutes = require("../routes/commentRoute");
const notificationRoutes = require("../routes/notiRoute");
const reactionRoutes = require("../routes/reactionRoute");
const tagRoutes = require("../routes/tagRoute");
const estadisticasRoutes = require("../routes/estadisticasRoute");
const visibilidadRoutes = require("../routes/visibilidadRoute");
const seguidoresRoutes = require("../routes/seguidoresRoute");

const siguiendoRoutes = require("../routes/siguiendoRoute");
const apiRoutes = require("../routes/apiRoute");
//Vistas
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '../views_pug'))



app.use('/', authRoutes);
app.use('/albums', imageRoutes);
app.use('/albums', albumRoutes);
app.use('/perfil', perfilRoutes);
app.use("/muro", muroRoutes) ;
app.use('/busqueda', busquedaRoutes);
app.use("/solicitudes", friendRoutes);
app.use("/comentarios", commentRoutes);
app.use("/notificaciones", notificationRoutes);
app.use("/reacciones", reactionRoutes);
app.use("/tags", tagRoutes);
app.use("/estadisticas", estadisticasRoutes);
app.use("/visibilidad", visibilidadRoutes);
app.use("/seguidores", seguidoresRoutes);
app.use("/siguiendo", siguiendoRoutes);
app.use("/api", apiRoutes);

//Error global
app.use((err, req, res, next) => {
  console.error('💥 Error capturado por el handler global:', err);

  res.status(500).send(err.message || 'Error interno del servidor');
});

module.exports =app;
