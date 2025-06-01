const { Comment, User, Image, Album } = require("../models/indexModel")
const { crearNotificacionComentario } = require("./notiController")

const crearComentario = async (req, res) => {
  try {

    const imageId = Number.parseInt(req.params.imageId)
    const userId = req.user.idUser


    let texto = null

    if (req.body && typeof req.body === "object") {
      texto = req.body.texto || req.body.comment || req.body.comentario
    }
    if (!texto || texto.trim() === "") {
      return res.status(400).json({ error: "El comentario no puede estar vacío" })
    }

   const imagen = await Image.findByPk(imageId, {
      include: [
        {
          model: Album,
          include: [
            {
              model: User,
              as: "propietario",
              attributes: ["idUser", "nombre"],
            },
          ],
        },
      ],
    })
    if (!imagen) {
      return res.status(404).json({ error: "Imagen no encontrada" })
    }

    const comentario = await Comment.create({
      image_id: imageId,
      user_id: userId,
      texto: texto.trim(),
    })
    if (imagen.Album && imagen.Album.propietario) {
      const propietarioId = imagen.Album.propietario.idUser
      if (userId !== propietarioId) {
        
        await crearNotificacionComentario(
          userId,
          propietarioId,
          comentario.idComment,
          imagen.caption || "tu imagen",
          texto.substring(0, 50) + (texto.length > 50 ? "..." : ""),
        )
      }
    }


    const comentarioCompleto = await Comment.findByPk(comentario.idComment, {
      include: [
        {
          model: User,
          attributes: ["idUser", "nombre", "foto"],
        },
      ],
    })

    res.json({
      success: true,
      comentario: comentarioCompleto,
    })
  } catch (err) {
    console.error("Error al crear comentario:", err)
    res.status(500).json({ error: "Error interno al crear comentario" })
  }
}

const eliminarComentario = async (req, res) => {
  try {
    const comentarioId = Number.parseInt(req.params.id)
    const userId = req.user.idUser

    const comentario = await Comment.findOne({
      where: {
        idComment: comentarioId,
        user_id: userId
      },
    })

    if (!comentario) {
      return res.status(404).json({ error: "Comentario no encontrado" })
    }

    await comentario.destroy()

    res.json({
      success: true,
      message: "Comentario eliminado",
    })
  } catch (err) {
    console.error("Error al eliminar comentario:", err)
    res.status(500).json({ error: "Error interno al eliminar comentario" })
  }
}

const obtenerComentarios = async (req, res) => {
  try {
    const imageId = Number.parseInt(req.params.imageId)

    const comentarios = await Comment.findAll({
      where: { image_id: imageId },
      include: [
        {
          model: User,
          attributes: ["idUser", "nombre", "foto"],
        },
      ],
      order: [["created_at", "ASC"]],
    })

    res.json({
      success: true,
      comentarios,
    })
  } catch (err) {
    console.error("Error al obtener comentarios:", err)
    res.status(500).json({ error: "Error interno al obtener comentarios" })
  }
}
const obtenerInfoComentario = async (req, res) => {
  try {
    const comentarioId = Number.parseInt(req.params.comentarioId)

    const comentario = await Comment.findByPk(comentarioId, {
      include: [
        {
          model: Image,
          include: [
            {
              model: Album,
              attributes: ["idAlbum"],
            },
          ],
        },
      ],
    })

    if (!comentario || !comentario.Image || !comentario.Image.Album) {
      return res.status(404).json({ error: "Comentario no encontrado" })
    }

    res.json({
      success: true,
      albumId: comentario.Image.Album.idAlbum,
      imageId: comentario.Image.idImage,
    })
  } catch (err) {
    console.error("Error al obtener información del comentario:", err)
    res.status(500).json({ error: "Error interno" })
  }
}
module.exports = {
  crearComentario,
  eliminarComentario,
  obtenerComentarios,
  obtenerInfoComentario
}
