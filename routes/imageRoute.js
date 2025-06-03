const express = require('express');
const router = express.Router();
const { subirImagen, eliminarImagen, obtenerInfoImagen } = require('../controllers/imageController');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { verificarToken, verificarTokenOpcional } = require('../middlewares/auth');


const upload = multer({ storage });

router.post('/:id/upload', 
  verificarToken,
  (req, res, next) => {upload.array("imagenes", 20)(req, res, (err) => {
      if (err) return next(err)
      next()
    })
  },
  subirImagen,
);

router.post('/imagenes/:id/eliminar',
   verificarToken, 
   eliminarImagen
);
router.get("/info/:imageId", verificarTokenOpcional, obtenerInfoImagen)

module.exports = router;
