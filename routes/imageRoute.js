const express = require('express');
const router = express.Router();
const { subirImagen, eliminarImagen } = require('../controllers/imageController');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { verificarToken } = require('../middlewares/auth');


const upload = multer({ storage });

router.post('/:id/upload', 
  verificarToken,
  (req, res, next) => {
    upload.single('imagen')(req, res, err => {
      console.log('Multer callback error:', err);
      if (err) return next(err);
      next();
    });
  }, subirImagen
);
router.post('/imagenes/:id/eliminar',
   verificarToken, 
   eliminarImagen
  );

module.exports = router;
