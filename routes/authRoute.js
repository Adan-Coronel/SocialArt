const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario } = require('../controllers/authController');

router.get('/', (req, res) => {
  res.render('index', { errorLogin: null, errorRegistro: null });
});

router.post('/registro', registrarUsuario);

router.post('/login', loginUsuario);

router.get('/logout',(req,res)=>{
  res.clearCookie('token');
  res.redirect('/')
})

module.exports = router;
