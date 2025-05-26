const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config()

const verificarToken = async (req, res, next) => {
 const token = req.cookies.token;
  if (!token) {
    return res.redirect('/');
  }

  try {
    const dec = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(dec.idUser || dec.id)
    if (!user) {
       return res.redirect('/');
    } 
    req.user = user
    
    next();
  } catch (err) {
    console.error("Token inválido - continuando como invitado:", err)
    res.clearCookie('token');
    return res.redirect('/');
  }
};
const verificarTokenOpcional = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decodificado.idUser || decodificado.id);
    req.user = user || null;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};


module.exports = { verificarToken, verificarTokenOpcional };



