const { User, FriendRequest } = require("../models/indexModel")

const verSeguidores = async (req, res) => {
  try {
    const userId = Number.parseInt(req.params.userId)
    const usuarioLogueado = req.user
    if (isNaN(userId)) {
      return res.status(404).render("error", {
        titulo: "Usuario no encontrado",
        mensaje: "El ID de usuario no es válido.",
        botonTexto: "Volver al muro",
        botonUrl: "/muro",
        usuarioLogueado,
      })
    }
    const usuario = await User.findByPk(userId, {
      attributes: ["idUser", "nombre", "email", "foto"],
    })

    if (!usuario) {
      return res.status(404).render("error", {
        titulo: "Usuario no encontrado",
        mensaje: "El usuario que buscas no existe.",
        botonTexto: "Volver al muro",
        botonUrl: "/muro",
        usuarioLogueado,
      })
    }

    const solicitudesAceptadas = await FriendRequest.findAll({
      where: {
        to_user: userId,
        status: "aceptada",
      },
      include: [
        {
          model: User,
          as: "emisor",
          attributes: ["idUser", "nombre", "email", "foto"],
        },
      ],
    })

    const seguidores = solicitudesAceptadas.map((solicitud) => solicitud.emisor)

    const contadorSeguidores = seguidores.length
    const contadorSiguiendo = await FriendRequest.count({
      where: {
        from_user: userId,
        status: "aceptada",
      },
    })

    res.render("seguidores", {
      usuario,
      usuarios: seguidores,
      tipo: "seguidores",
      contadores: {
        seguidores: contadorSeguidores,
        siguiendo: contadorSiguiendo,
      },
      usuarioLogueado,
    })
  } catch (err) {
    console.error("Error al cargar seguidores:", err)
    res.status(500).render("error", {
      titulo: "Error interno",
      mensaje: "Ha ocurrido un error al cargar los seguidores.",
      botonTexto: "Volver al muro",
      botonUrl: "/muro",
      usuarioLogueado: req.user,
    })
  }
}

const verSiguiendo = async (req, res) => {
  try {
    const userId = Number.parseInt(req.params.userId)
    const usuarioLogueado = req.user
    if (isNaN(userId)) {
      return res.status(404).render("error", {
        titulo: "Usuario no encontrado",
        mensaje: "El ID de usuario no es válido.",
        botonTexto: "Volver al muro",
        botonUrl: "/muro",
        usuarioLogueado,
      })
    }
    const usuario = await User.findByPk(userId, {
      attributes: ["idUser", "nombre", "email", "foto"],
    })

    if (!usuario) {
      return res.status(404).render("error", {
        titulo: "Usuario no encontrado",
        mensaje: "El usuario que buscas no existe.",
        botonTexto: "Volver al muro",
        botonUrl: "/muro",
        usuarioLogueado,
      })
    }

    const solicitudesAceptadas = await FriendRequest.findAll({
      where: {
        from_user: userId,
        status: "aceptada",
      },
      include: [
        {
          model: User,
          as: "receptor",
          attributes: ["idUser", "nombre", "email", "foto"],
        },
      ],
    })

    const siguiendo = solicitudesAceptadas.map((solicitud) => solicitud.receptor)

    const contadorSiguiendo = siguiendo.length
    const contadorSeguidores = await FriendRequest.count({
      where: {
        to_user: userId,
        status: "aceptada",
      },
    })

    res.render("seguidores", {
      usuario,
      usuarios: siguiendo,
      tipo: "siguiendo",
      contadores: {
        seguidores: contadorSeguidores,
        siguiendo: contadorSiguiendo,
      },
      usuarioLogueado,
    })
  } catch (err) {
    console.error("Error al cargar seguidos:", err)
    res.status(500).render("error", {
      titulo: "Error interno",
      mensaje: "Ha ocurrido un error al cargar los usuarios seguidos.",
      botonTexto: "Volver al muro",
      botonUrl: "/muro",
      usuarioLogueado: req.user,
    })
  }
}

module.exports = {
  verSeguidores,
  verSiguiendo,
}
