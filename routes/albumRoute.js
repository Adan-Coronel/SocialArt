const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const { verAlbum, crearAlbum, eliminarAlbum } = require('../controllers/albumController');

router.get('/:id', verificarToken, verAlbum);
router.post('/', verificarToken, crearAlbum);
router.post('/:id/eliminar', verificarToken, eliminarAlbum);
module.exports = router;
