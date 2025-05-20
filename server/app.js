const express = require('express');
const mysql = require(`mysql2`)
const path = require(`path`)
const app = express()
const PORT = 3000


require(`../data/db`)

app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, '../public')));

app.set('view engine', 'pug')

app.set('views', path.join(__dirname, '../views_pug'))

app.get('/', (req, res) => {
  res.render('registro', {
  })
})

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`)
})

app.post('/registro', (req, res) => {
  const { nombreUsuario, usuarioMail, usuarioContraseña, vUsuarioContraseña } = req.body
  console.log(`usuario = `, nombreUsuario)
  console.log(`email = `, usuarioMail)
  console.log(`password = `, usuarioContraseña)
  console.log(`verificacion de password = `, vUsuarioContraseña)
  res.send('Datos recibidos');
})