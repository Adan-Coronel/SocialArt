const Image = require('../models/imageModel');

const subirImagen = async (req, res) => {
  console.log('BODY:', req.body);
  console.log('FILE:', req.file);
  console.log('PARAMS:', req.params);

  try {
    if (!req.file || !req.file.path) {
      throw new Error('No se recibió archivo válido desde Cloudinary');
    }
    await Image.create({
      album_id: req.params.id,
      url: req.file.path,
      caption: req.body.caption
    });

    res.redirect(`/albums/${req.params.id}`);
  } catch (err) {
    console.error('Error al subir imagen:', err);
    res.status(500).send(err.message || 'Error interno');
  }
};
module.exports = { subirImagen };