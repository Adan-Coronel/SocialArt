const express = require('express');
const router = express.Router();
const { verificarToken, verificarTokenOpcional } = require('../middlewares/auth');
const { verPerfil, verPerfilPublico, actualizarPerfil } = require('../controllers/perfilController');
const multer = require('multer');
const { storage } = require('../config/cloudinary');


const upload = multer({ storage });
router.get('/', verificarToken, verPerfil);
router.get("/:userId", verificarTokenOpcional, verPerfilPublico)
router.post('/editar', verificarToken, upload.single('foto'), actualizarPerfil);
module.exports = router;
