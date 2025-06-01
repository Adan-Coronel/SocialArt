const { Image } = require('../models/indexModel');

const subirImagen = async (req, res) => {

  try {
    const albumId = req.params.id

    const { Album } = require("../models/indexModel")
    const album = await Album.findByPk(albumId, {
      include: [{ model: Image }],
    })

    if (!album) {
      return res.status(404).send("Álbum no encontrado")
    }

    if (album.user_id !== req.user.idUser) {
      return res.status(403).send("No tienes permiso para subir imágenes a este álbum")
    }

    const imagenesActuales = album.Images ? album.Images.length : 0
    const nuevasImagenes = req.files ? req.files.length : req.file ? 1 : 0

    if (imagenesActuales + nuevasImagenes > 20) {
      return res
        .status(400)
        .send(
          `No puedes subir más imágenes. Límite: 20 imágenes por álbum. Actualmente tienes ${imagenesActuales} imágenes.`,
        )
    }


    const archivos = req.files || (req.file ? [req.file] : [])

    if (archivos.length === 0) {
      throw new Error("No se recibieron archivos válidos")
    }

    for (const archivo of archivos) {
      if (!archivo.path) {
        throw new Error("Archivo inválido desde Cloudinary")
      }
      await Image.create({
        album_id: req.params.id,
        url: archivo.path,
        caption: req.body.caption
      });
    }
    res.redirect(`/albums/${req.params.id}`);
  } catch (err) {
    console.error('Error al subir imagen:', err);
    res.status(500).send(err.message || 'Error interno');
  };
};

const eliminarImagen = async (req, res) => {
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