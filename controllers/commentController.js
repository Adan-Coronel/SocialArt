const { Comment, User, Image, Album } = require("../models/indexModel")
const { crearNotificacionComentario } = require("./notiController")

const crearComentario = async (req, res) => {
  try {
    console.log("🔍 DATOS DE LA SOLICITUD:")
    console.log("- Headers:", req.headers)
    console.log("- Body completo:", req.body)
    console.log("- Query:", req.query)
    console.log("- Params:", req.params)
    const imageId = Number.parseInt(req.params.imageId)
    const userId = req.user.idUser


    let texto = null

    if (req.body && typeof req.body === "object") {
      texto = req.body.texto || req.body.comment || req.body.comentario
    } else if (typeof req.body === "string") {
      try {
        // Intentar parsear si viene como string
        const parsedBody = JSON.parse(req.body)
        texto = parsedBody.texto || parsedBody.comment || parsedBody.comentario
      } catch (e) {
        texto = req.body // Usar el string completo como último recurso
      }
    }

    // Si aún no tenemos texto, intentar con query params
    if (!texto && req.query) {
      texto = req.query.texto || req.query.comment || req.query.comentario
    }

    console.log("📝 Texto extraído:", texto)

    if (!texto || texto.trim() === "") {
      return res.status(400).json({ error: "El comentario no puede estar vacío" })
    }

    const imagen = await Image.findByPk(imageId)
    if (!imagen) {
      return res.status(404).json({ error: "Imagen no encontrada" })
    }

    // Buscar el álbum y propietario
    const album = await Album.findByPk(imagen.album_id, {
      include: [
        {
          model: User,
          as: "propietario",
          attributes: ["idUser", "nombre"],
        },
      ],
    })



    const comentario = await Comment.create({
      image_id: imageId,
      user_id: userId,
      texto: texto.trim(),
    })
    if (album && album.propietario) {
      const propietarioId = album.propietario.idUser
      if (userId !== propietarioId) {
        await crearNotificacionComentario(userId, propietarioId, comentario.idComment, imagen.caption || "tu imagen")
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

module.exports = {
  crearComentario,
  eliminarComentario,
  obtenerComentarios,
}
