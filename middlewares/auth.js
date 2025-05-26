const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config()

const verificarToken = async (req, res, next) => {
  const token = req.cookies.token;
  //console.log('Middleware verificarToken ejecutado');

  if (!token) {
    //console.log('⛔ No hay token');
    return res.redirect('/');
  }

  try {
    const dec = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(dec.id);
    if (!user) return res.redirect('/');
    req.user = user;
    next();
  } catch (err) {
    console.error('Token inválido:', err);
    return res.redirect('/');
  }
};

module.exports = { verificarToken };
