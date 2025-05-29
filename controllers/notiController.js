const { Notification, User, FriendRequest, Comment, Image } = require("../models/indexModel")

const crearNotificacionSolicitud = async (fromUserId, toUserId, solicitudId) => {
  try {
    await Notification.create({
      user_id: toUserId,
      tipo: "solicitud_amistad",
      from_user_id: fromUserId,
      ref_id: solicitudId,
      mensaje: "te envió una solicitud de amistad",
    });

  } catch (err) {
    console.error("Error al crear notificación de solicitud:", err)
  }
}


const crearNotificacionComentario = async (fromUserId, toUserId, comentarioId, imagenTitulo) => {
  try {
    await Notification.create({
      user_id: toUserId,
      tipo: "comentario",
      from_user_id: fromUserId,
      ref_id: comentarioId,
      mensaje: `comentó en tu imagen "${imagenTitulo}"`,
    });

  } catch (err) {
    console.error("Error al crear notificación de comentario:", err)
  }
}

const crearNotificacionSolicitudAceptada = async (fromUserId, toUserId, solicitudId) => {
  try {
    await Notification.create({
      user_id: toUserId,
      tipo: "solicitud_aceptada",
      from_user_id: fromUserId,
      ref_id: solicitudId,
      mensaje: "aceptó tu solicitud de amistad",
    });

  } catch (err) {
    console.error("Error al crear notificación de aceptación:", err)
  }
}

const obtenerNotificacionesPendientes = async (req, res) => {
  try {
    const usuarioLogueado = req.user.idUser

    const notificaciones = await Notification.findAll({
      where: {
        user_id: usuarioLogueado,
        leido: false,
      },
      include: [
        {
          model: User,
          as: "emisor",
          attributes: ["idUser", "nombre", "foto"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: 10, 
    });

    const totalNotificaciones = await Notification.count({
      where: {
        user_id: usuarioLogueado,
        leido: false,
      },
    });

    res.json({
      success: true,
      notificaciones,
      count: totalNotificaciones,
      hayMas: totalNotificaciones > 10,
    })
  } catch (err) {
    console.error("Error al obtener notificaciones:", err)
    res.status(500).json({ error: "Error interno al cargar notificaciones" })
  }
}

const verTodasLasNotificaciones = async (req, res) => {
  try {
    const usuarioLogueado = req.user.idUser

    const notificaciones = await Notification.findAll({
      where: {
        user_id: usuarioLogueado,
      },
      include: [
        {
          model: User,
          as: "emisor",
          attributes: ["idUser", "nombre", "foto"],
        },
      ],
      order: [["created_at", "DESC"]],

    })

    await Notification.update({ leido: true }, { where: { user_id: usuarioLogueado, leido: false } })

    res.render("notificaciones", {
      notificaciones,
      user: req.user,
      title: "Todas las Notificaciones",
    })
  } catch (err) {
    console.error("Error al obtener todas las notificaciones:", err)
    res.status(500).send("Error interno al cargar notificaciones")
  }
}

const manejarAccionNotificacion = async (req, res) => {
  try {
    const { notificationId, action } = req.params
    const usuarioLogueado = req.user.idUser

    const notificacion = await Notification.findOne({
      where: {
        idNotification: notificationId,
        user_id: usuarioLogueado,
      },
    })

    if (!notificacion) {
      return res.status(404).json({ error: "Notificación no encontrada" })
    }

    await notificacion.update({ leido: true })

    if (notificacion.tipo === "solicitud_amistad") {
      if (action === "aceptar") {
        const solicitud = await FriendRequest.findByPk(notificacion.ref_id)
        if (solicitud && solicitud.status === "pendiente") {
          await solicitud.update({ status: "aceptada" })
          await crearNotificacionSolicitudAceptada(
            usuarioLogueado,
            notificacion.from_user_id,
            solicitud.idFriendRequest,
          )
        }
      } else if (action === "rechazar") {
        const solicitud = await FriendRequest.findByPk(notificacion.ref_id)
        if (solicitud && solicitud.status === "pendiente") {
          await solicitud.update({ status: "rechazada" })
        }
      }
    }

    res.json({ success: true, message: "Acción completada" })
  } catch (err) {
    console.error("Error al manejar acción:", err)
    res.status(500).json({ error: "Error interno" })
  }
}

module.exports = {
  crearNotificacionSolicitud,
  crearNotificacionComentario,
  crearNotificacionSolicitudAceptada,
  obtenerNotificacionesPendientes,
  verTodasLasNotificaciones,
  manejarAccionNotificacion,
}