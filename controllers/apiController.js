const { User, FriendRequest } = require("../models/indexModel")

const obtenerSiguiendo = async (req, res) => {
  try {
    const userId = req.user.idUser

    const solicitudesAceptadas = await FriendRequest.findAll({
      where: {
        from_user: userId,
        status: "aceptada",
      },
      include: [
        {
          model: User,
          as: "receptor",
          attributes: ["idUser", "nombre", "foto"],
        },
      ],
    })

    const siguiendo = solicitudesAceptadas.map((solicitud) => solicitud.receptor)

    res.json({
      success: true,
      siguiendo,
    })
  } catch (err) {
    console.error("Error al obtener siguiendo:", err)
    res.status(500).json({ error: "Error interno al obtener usuarios seguidos" })
  }
}

module.exports = {
  obtenerSiguiendo,
}
