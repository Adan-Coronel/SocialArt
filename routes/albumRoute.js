const express = require('express');
const router = express.Router();
const { verificarTokenOpcional } = require('../middlewares/auth');
const { verAlbum, crearAlbum, eliminarAlbum, editarAlbum, verFormularioEditarAlbum } = require('../controllers/albumController');

router.get('/:id', verificarTokenOpcional, verAlbum);
router.post('/', verificarTokenOpcional, crearAlbum);
router.post("/:id/editar", verificarTokenOpcional, editarAlbum)
router.get("/:id/editar", verificarTokenOpcional, verFormularioEditarAlbum)
router.post('/:id/eliminar', verificarTokenOpcional, eliminarAlbum);
module.exports = router;
