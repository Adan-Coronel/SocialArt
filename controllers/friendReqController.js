const { User, FriendRequest } = require("../models/indexModel")
const { crearNotificacionSolicitud, crearNotificacionSolicitudAceptada } = require("./notiController")

const enviarSolicitud = async (req, res) => {
  try {
    const fromUser = req.user.idUser
    const toUser = Number.parseInt(req.params.idUser)

    const solicitud = await FriendRequest.create({
      from_user: fromUser,
      to_user: toUser,
      status: "pendiente",
    })
    await crearNotificacionSolicitud(fromUser, toUser, solicitud.idFriendRequest)

    res.json({
      success: true,
      message: "Solicitud enviada correctamente",
      newStatus: "Solicitud enviada",
    })
  } catch (err) {
    console.error("Error al enviar solicitud de amistad:", err)
    res.status(500).json({ error: "Error interno al enviar solicitud" })
  }
}

const aceptarSolicitud = async (req, res) => {
  try {
    const usuarioLogueado = req.user.idUser
    const solicitudId = Number.parseInt(req.params.id)

    const solicitud = await FriendRequest.findOne({
      where: {
        idFriendRequest: solicitudId,
        to_user: usuarioLogueado,
        status: "pendiente",
      },
    })

    if (!solicitud) {
      return res.status(404).json({ error: "Solicitud no encontrada" })
    }

    await solicitud.update({ status: "aceptada" })

    await crearNotificacionSolicitudAceptada(usuarioLogueado, solicitud.from_user, solicitudId)

    res.json({
      success: true,
      message: "Solicitud aceptada correctamente",
    })
  } catch (err) {
    console.error("Error al aceptar solicitud:", err)
    res.status(500).json({ error: "Error interno al aceptar solicitud" })
  }
}

const rechazarSolicitud = async (req, res) => {
  try {
    const usuarioLogueado = req.user.idUser
    const solicitudId = Number.parseInt(req.params.id)

    const solicitud = await FriendRequest.findOne({
      where: {
        idFriendRequest: solicitudId,
        to_user: usuarioLogueado,
        status: "pendiente",
      },
    })

    if (!solicitud) {
      return res.status(404).json({ error: "Solicitud no encontrada" })
    }

    await solicitud.update({ status: "rechazada" })

    res.json({
      success: true,
      message: "Solicitud rechazada",
    })
  } catch (err) {
    console.error("Error al rechazar solicitud:", err)
    res.status(500).json({ error: "Error interno al rechazar solicitud" })
  }
}

const cancelarSolicitud = async (req, res) => {
  try {
    const fromUser = req.user.idUser
    const toUser = Number.parseInt(req.params.idUser)

    const solicitud = await FriendRequest.findOne({
      where: {
        from_user: fromUser,
        to_user: toUser,
        status: "pendiente",
      },
    })

    if (!solicitud) {
      return res.status(404).json({ error: "Solicitud no encontrada" })
    }

    await solicitud.destroy()

    res.json({
      success: true,
      message: "Solicitud cancelada",
      newStatus: "Añadir amigo",
    })
  } catch (err) {
    console.error("Error al cancelar solicitud:", err)
    res.status(500).json({ error: "Error interno al cancelar solicitud" })
  }
}


const obtenerEstadoRelacion = async (usuarioLogueado, otroUsuario) => {
  if (!usuarioLogueado || usuarioLogueado === otroUsuario) {
    return null
  }


  const solicitudEnviada = await FriendRequest.findOne({
    where: {
      from_user: usuarioLogueado,
      to_user: otroUsuario,
      status: ["pendiente", "aceptada"],
    },
  })

  if (solicitudEnviada) {
    if (solicitudEnviada.status === "aceptada") {
      return "amigos"
    }
    if (solicitudEnviada.status === "pendiente") {
      return "solicitud_enviada"
    }
  }

  const solicitudRecibida = await FriendRequest.findOne({
    where: {
      from_user: otroUsuario,
      to_user: usuarioLogueado,
      status: "pendiente",
    },
  })

  if (solicitudRecibida) {
    return "solicitud_recibida"
  }

  return "sin_relacion"
}

module.exports = {
  enviarSolicitud,
  aceptarSolicitud,
  rechazarSolicitud,
  cancelarSolicitud,
  obtenerEstadoRelacion,
}
