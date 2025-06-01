const { Reaction, Image, Album, User } = require("../models/indexModel")
const { crearNotificacionReaccion } = require("./notiController")

const toggleReaction = async (req, res) => {
  try {
    const imageId = Number.parseInt(req.params.imageId)
    const userId = req.user.idUser

    // Verificar si ya existe la reacción
    const reaccionExistente = await Reaction.findOne({
      where: {
        image_id: imageId,
        user_id: userId,
      },
    })

    if (reaccionExistente) {
      // Eliminar reacción
      await reaccionExistente.destroy()

      // Contar reacciones actuales
      const totalReacciones = await Reaction.count({
        where: { image_id: imageId },
      })

      res.json({
        success: true,
        action: "removed",
        totalReacciones,
      })
    } else {
      // Crear nueva reacción
      await Reaction.create({
        image_id: imageId,
        user_id: userId,
        tipo: "like",
      })

      // Obtener información de la imagen para notificación
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

      if (imagen && imagen.Album && imagen.Album.propietario) {
        const propietarioId = imagen.Album.propietario.idUser
        if (userId !== propietarioId) {
          await crearNotificacionReaccion(userId, propietarioId, imageId, imagen.caption || "tu imagen")
        }
      }

      // Contar reacciones actuales
      const totalReacciones = await Reaction.count({
        where: { image_id: imageId },
      })

      res.json({
        success: true,
        action: "added",
        totalReacciones,
      })
    }
  } catch (err) {
    console.error("Error al manejar reacción:", err)
    res.status(500).json({ error: "Error interno al procesar reacción" })
  }
}

const obtenerReacciones = async (req, res) => {
  try {
    const imageId = Number.parseInt(req.params.imageId)
    const userId = req.user?.idUser

    const totalReacciones = await Reaction.count({
      where: { image_id: imageId },
    })

    let usuarioReacciono = false
    if (userId) {
      const reaccionUsuario = await Reaction.findOne({
        where: {
          image_id: imageId,
          user_id: userId,
        },
      })
      usuarioReacciono = !!reaccionUsuario
    }

    res.json({
      success: true,
      totalReacciones,
      usuarioReacciono,
    })
  } catch (err) {
    console.error("Error al obtener reacciones:", err)
    res.status(500).json({ error: "Error interno al obtener reacciones" })
  }
}

module.exports = {
  toggleReaction,
  obtenerReacciones,
}
