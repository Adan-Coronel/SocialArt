const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const { verPerfil, actualizarPerfil } = require('../controllers/perfilController');
const multer = require('multer');
const { storage } = require('../config/cloudinary');


const upload = multer({ storage });
router.get('/', verificarToken, verPerfil);
router.post('/editar', verificarToken, upload.single('foto'), actualizarPerfil);
module.exports = router;
