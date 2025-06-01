const express = require('express');
const router = express.Router();
const { verificarTokenOpcional } = require('../middlewares/auth');
const { verAlbum, verAlbumes, crearAlbum, eliminarAlbum } = require('../controllers/albumController');

router.get('/:id', verificarTokenOpcional, verAlbum);
router.get('/', verificarTokenOpcional, verAlbumes)
router.post('/', verificarTokenOpcional, crearAlbum);
router.post('/:id/eliminar', verificarTokenOpcional, eliminarAlbum);
module.exports = router;
