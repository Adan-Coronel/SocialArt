const express = require('express');
const router = express.Router();
const { subirImagen } = require('../controllers/imageController');
const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({ storage });
router.get('/:id/upload', async (req, res) => {
  const albumId = req.params.id;

  // Si querés, buscás el álbum con Sequelize (opcional):
  // const album = await Album.findByPk(albumId);
    console.log('Subida a Cloudinary:', req.file);
  res.render('subir_imagen', { album: { id: albumId } }); // solo pasamos el id
});

router.post('/:id/upload', (req, res, next) => {
  upload.single('imagen')(req, res, err => {
    console.log('🔍 Multer callback error:', err);
    if (err) return next(err);       // pasa el error al handler global
    next();                          // sin errores, sigue al controlador
  });
}, subirImagen);

module.exports = router;
