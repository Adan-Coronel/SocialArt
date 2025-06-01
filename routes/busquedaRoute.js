const express = require('express');
const router = express.Router();
const { buscarContenido } = require('../controllers/busquedaController');
const { verificarTokenOpcional } = require('../middlewares/auth');

router.get('/', verificarTokenOpcional, buscarContenido);

module.exports = router;
