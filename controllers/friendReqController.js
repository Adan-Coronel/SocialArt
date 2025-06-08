const { FriendRequest } = require("../models/indexModel")
const { crearNotificacionSolicitud, crearNotificacionSolicitudAceptada } = require("./notiController")
const { enviarNotificacionEnTiempoReal } = require("./notificacionesRealTime")

const crearAlbumCompartido = async (ownerId, viewerId) => {
  try {
    const { SharedAlbum, Album, User, Image, ImageVisibility } = require("../models/indexModel")

    const albumExistente = await SharedAlbum.findOne({
      where: {
        owner_id: ownerId,
        viewer_id: viewerId,
      },
    })

    if (albumExistente) {
      return null
    }

    const propietario = await User.findByPk(ownerId, {
      attributes: ["nombre"],
    })
    if (!propietario) {
      console.error("❌ Propietario no encontrado")
      return null
    }

    const nuevoAlbum = await Album.create({
      user_id: viewerId,
      titulo: `📤 ${propietario.nombre}`,
      is_public: false,
      created_at: new Date(),
    })

    const sharedAlbum = await SharedAlbum.create({
      owner_id: ownerId,
      viewer_id: viewerId,
      album_id: nuevoAlbum.idAlbum,
    })

    const imagenesDelPropietario = await Image.findAll({
      include: [
        {
          model: Album,
          where: {
            user_id: ownerId,
          },
          include: [
            {
              model: SharedAlbum,
              required: false,
            },
          ],
        },
      ],
      where: {
        "$Album.SharedAlbums.album_id$": null,
      },
    })
    for (const imagen of imagenesDelPropietario) {
      await ImageVisibility.create({
        image_id: imagen.idImage,
        user_id: viewerId,
        can_view: true,
      })
    }
    return nuevoAlbum
  } catch (err) {
    console.error("Error al crear álbum compartido:", err)
    return null
  }
}
const procesarAceptacionSolicitud = async (solicitudId, usuarioQueAcepta) => {
  const solicitud = await FriendRequest.findOne({
    where: {
      idFriendRequest: solicitudId,
      to_user: usuarioQueAcepta,
      status: "pendiente",
    },
  })

  if (!solicitud) {
    throw new Error("Solicitud no encontrada")
  }

  await solicitud.update({ status: "aceptada" })

  try {
    await crearAlbumCompartido(usuarioQueAcepta, solicitud.from_user)
    await crearAlbumCompartido(solicitud.from_user, usuarioQueAcepta)
  } catch (albumError) {
    console.error("Error al crear álbumes compartidos:", albumError)
  }

  await crearNotificacionSolicitudAceptada(usuarioQueAcepta, solicitud.from_user, solicitudId)

  return solicitud
}

const procesarRechazoSolicitud = async (solicitudId, usuarioQueRechaza) => {
  const solicitud = await FriendRequest.findOne({
    where: {
      idFriendRequest: solicitudId,
      to_user: usuarioQueRechaza,
      status: "pendiente",
    },
  })

  if (!solicitud) {
    throw new Error("Solicitud no encontrada")
  }

  await solicitud.update({ status: "rechazada" })
  return solicitud
}


const enviarSolicitud = async (req, res) => {
  try {
    const fromUser = req.user.idUser
    const toUser = Number.parseInt(req.params.idUser)
    const solicitudExistente = await FriendRequest.findOne({
      where: {
        from_user: fromUser,
        to_user: toUser,
        status: "pendiente",
      },
    })
    if (solicitudExistente) {
      return res.status(400).json({
        error: "Ya enviaste una solicitud a este usuario",
        newStatus: "Solicitud enviada",
      })
    }

    const yaAmigos = await FriendRequest.findOne({
      where: {
        from_user: fromUser,
        to_user: toUser,
        status: "aceptada",
      },
    })

    if (yaAmigos){
      return res.status(400).json({
        error: "Ya sigues a este usuario",
        newStatus: "Siguiendo",
      })
    }


    const nuevaSolicitud = await FriendRequest.create({
      from_user: fromUser,
      to_user: toUser,
      status: "pendiente",
    })
 
    await crearNotificacionSolicitud(fromUser, toUser, nuevaSolicitud.idFriendRequest)

    const notificacion = {
      tipo: "solicitud_amistad",
      mensaje: `${req.user.nombre} te envió una solicitud de amistad`,
      from_user: {
        idUser: req.user.idUser,
        nombre: req.user.nombre,
        foto: req.user.foto,
      },
    }
    enviarNotificacionEnTiempoReal(toUser, notificacion)
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

    await solicitud.update({ status: "aceptada" });
    try {
      await crearAlbumCompartido(usuarioLogueado, solicitud.from_user)
      await crearAlbumCompartido(solicitud.from_user, usuarioLogueado)
    } catch (albumError) {
      console.error("Error al crear álbumes compartidos:", albumError)
    }

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
      newStatus: "Seguir",
    })
  } catch (err) {
    console.error("Error al cancelar solicitud:", err)
    res.status(500).json({ error: "Error interno al cancelar solicitud" })
  }
}
const dejarDeSeguir = async (req, res) => {
  try {
    const fromUser = req.user.idUser
    const toUser = Number.parseInt(req.params.idUser)
    const solicitud = await FriendRequest.findOne({
      where: {
        from_user: fromUser,
        to_user: toUser,
        status: "aceptada",
      },
    })

    if (!solicitud) {
      return res.status(404).json({ error: "No sigues a este usuario" })
    }

    const { SharedAlbum, Album, ImageVisibility } = require("../models/indexModel")

    const albumCompartido = await SharedAlbum.findOne({
      where: {
        owner_id: toUser,
        viewer_id: fromUser,
      },
      include: [Album],
    })

    if (albumCompartido) {
      await ImageVisibility.destroy({
        where: { user_id: fromUser },
      })

      await Album.destroy({
        where: { idAlbum: albumCompartido.album_id },
      })

      await albumCompartido.destroy()
    }
    await solicitud.destroy()
    res.json({
      success: true,
      message: "Dejaste de seguir a este usuario",
      newStatus: "Seguir",
    })
  } catch (err) {
    console.error("Error al dejar de seguir:", err)
    res.status(500).json({ error: "Error interno" })
  }
}


const cancelarSeguimiento = async (req, res) => {
  try {
    const toUser = req.user.idUser
    const fromUser = Number.parseInt(req.params.idUser)
    const solicitud = await FriendRequest.findOne({
      where: {
        from_user: fromUser,
        to_user: toUser,
        status: "aceptada",
      },
    })

    if (!solicitud) {
      return res.status(404).json({ error: "Este usuario no te sigue" })
    }

    const { SharedAlbum, Album, ImageVisibility } = require("../models/indexModel")

    const albumCompartido = await SharedAlbum.findOne({
      where: {
        owner_id: toUser,
        viewer_id: fromUser,
      },
      include: [Album],
    })

    if (albumCompartido) {
      await ImageVisibility.destroy({
        where: { user_id: fromUser },
      })

      await Album.destroy({
        where: { idAlbum: albumCompartido.album_id },
      })

      await albumCompartido.destroy()
    }

    await solicitud.destroy()
    res.json({
      success: true,
      message: "Cancelaste el seguimiento de este usuario",
      newStatus: "No te sigue",
    })
  } catch (err) {
    console.error("Error al cancelar seguimiento:", err)
    res.status(500).json({ error: "Error interno" })
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
  dejarDeSeguir,
  cancelarSeguimiento,
  obtenerEstadoRelacion,
  procesarAceptacionSolicitud,
  procesarRechazoSolicitud
}
