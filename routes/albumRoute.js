const express = require('express');
const router = express.Router();
const { verificarTokenOpcional } = require('../middlewares/auth');
const { verAlbum, crearAlbum, eliminarAlbum, editarAlbum } = require('../controllers/albumController');

router.get('/:id', verificarTokenOpcional, verAlbum);
router.post('/', verificarTokenOpcional, crearAlbum);
router.post("/:id/editar", verificarTokenOpcional, editarAlbum)
router.post('/:id/eliminar', verificarTokenOpcional, eliminarAlbum);
module.exports = router;
