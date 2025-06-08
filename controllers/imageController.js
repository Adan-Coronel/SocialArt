const { Image, Album } = require('../models/indexModel');
const express = require("express")
const router = express.Router()
const subirImagen = async (req, res) => {

  try {
    const albumId = req.params.id

    const album = await Album.findByPk(albumId, {
      include: [{ model: Image }],
    })

    if (!album) {
      return mostrarError(res, "Álbum no encontrado", "El álbum al que intentas subir imágenes no existe.")
    }

    if (album.user_id !== req.user.idUser) {
      return mostrarError(res, "Permiso denegado", "No tienes permiso para subir imágenes a este álbum.")    }

    const imagenesActuales = album.Images ? album.Images.length : 0
    const nuevasImagenes = req.files ? req.files.length : req.file ? 1 : 0

    if (imagenesActuales + nuevasImagenes > 20) {
      return mostrarError(
        res,
        "Límite de imágenes alcanzado",
        `No puedes subir más imágenes. Límite: 20 imágenes por álbum. Actualmente tienes ${imagenesActuales} imágenes.`,
      )
    }


    const archivos = req.files || (req.file ? [req.file] : [])

    if (archivos.length === 0) {
      return mostrarError(res, "No hay archivos", "No se recibieron archivos válidos para subir.")
    }

    for (const archivo of archivos) {
      if (!archivo.path) {
        return mostrarError(res, "Error en archivo", "Archivo inválido desde Cloudinary.")
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
    mostrarError(res, "Error interno", err.message || "Error interno al subir imágenes.")
  };
};

const eliminarImagen = async (req, res) => {
  try {
    const imagen = await Image.findByPk(req.params.id);
    if (!imagen){
      return mostrarError(res, "Imagen no encontrada", "La imagen que intentas eliminar no existe.")
    }
    const album = await Album.findByPk(imagen.album_id)
    if (album.user_id !== req.user.idUser) {
      return mostrarError(res, "Permiso denegado", "No tienes permiso para eliminar esta imagen.")
    }
    await imagen.destroy();
    res.redirect(`/albums/${imagen.album_id}`);
  } catch (err) {
    console.error('Error al eliminar imagen:', err);
    mostrarError(res, "Error interno", "Error al eliminar imagen.")
  }
};
const obtenerInfoImagen = async (req, res) => {
  try {
    const imageId = Number.parseInt(req.params.imageId)

    const imagen = await Image.findByPk(imageId, {
      include: [
        {
          model: Album,
          attributes: ["idAlbum"],
        },
      ],
    })

    if (!imagen || !imagen.Album) {
      return res.status(404).json({ error: "Imagen no encontrada" })
    }

    res.json({
      success: true,
      albumId: imagen.Album.idAlbum,
      imageId: imagen.idImage,
    })
  } catch (err) {
    console.error("Error al obtener información de la imagen:", err)
    res.status(500).json({ error: "Error interno" })
  }
};

const mostrarError = (res, titulo, mensaje) => {
  return res.status(400).render("error", {
    titulo: titulo,
    mensaje: mensaje,
    botonTexto: "Volver",
    botonUrl: "javascript:history.back()",
    usuarioLogueado: res.locals.usuarioLogueado || req.user,
  })
};

module.exports = { subirImagen, eliminarImagen, obtenerInfoImagen };