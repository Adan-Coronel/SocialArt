const express = require('express');

const path = require(`path`)
const app = express()
const PORT = 3000
const cookieParser = require('cookie-parser');
const authRoutes = require('../routes/authRoute');
const imageRoutes = require('../routes/imageRoute');
const albumRoutes = require('../routes/albumRoute');
const perfilRoutes = require('../routes/perfilRoute');


app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser());


app.use('/', authRoutes);
app.use('/albums', imageRoutes)
app.use('/albums', albumRoutes)
app.use('/perfil', perfilRoutes);

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '../views_pug'))

app.get('/', (req, res) => {
  res.render('index', {
  })
})



app.post('/registro', (req, res) => {
  const { nombreUsuario, usuarioMail, usuarioContraseña, vUsuarioContraseña } = req.body
  console.log(`usuario = `, nombreUsuario)
  console.log(`email = `, usuarioMail)
  console.log(`password = `, usuarioContraseña)
  console.log(`verificacion de password = `, vUsuarioContraseña)
  res.send('Datos recibidos');
})


app.use((err, req, res, next) => {
  console.error('💥 Error capturado por el handler global:', err);
  // si es un error de multer o cloudinary
  if (err.name === 'MulterError' || err.http_code) {
    return res.status(500).send(err.message || JSON.stringify(err));
  }
  // cualquier otro error
  res.status(500).send(err.message || 'Error interno del servidor');
});

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`)
})