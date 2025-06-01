const { Image } = require('../models/indexModel');

const subirImagen = async (req, res) => {

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

const  eliminarImagen = async (req, res) => {
  try {
    const imagen = await Image.findByPk(req.params.id);
    if (!imagen) return res.status(404).send('Imagen no encontrada');

    await imagen.destroy();
    res.redirect(`/albums/${imagen.album_id}`);
  } catch (err) {
    console.error('Error al eliminar imagen:', err);
    res.status(500).send('Error al eliminar imagen');
  }
};
module.exports = { subirImagen, eliminarImagen };