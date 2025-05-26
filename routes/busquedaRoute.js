const express = require('express');
const router = express.Router();
const { buscarUsuarios } = require('../controllers/busquedaController');
const { verificarTokenOpcional } = require('../middlewares/auth');

router.get('/', verificarTokenOpcional, buscarUsuarios);

module.exports = router;
