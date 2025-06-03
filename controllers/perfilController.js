const { User, Album, FriendRequest, SharedAlbum } = require('../models/indexModel');
const { Op } = require("sequelize");
const bcrypt = require("bcrypt")

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
      return "siguiendo"
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
const verPerfil = async (req, res) => {
  if (!req.user) return res.redirect('/');

  const usuario = await User.findByPk(req.user.idUser, {
    include: [
      {
       model: Album, 
       as: 'albums',
       include: [
          {
            model: SharedAlbum,
            required: false,
          },
        ]
      }
    ]
  });
  usuario.albums = usuario.albums.filter(album => !album.SharedAlbums || album.SharedAlbums.length === 0);
  if (!usuario) return res.redirect('/');

  const albumesCompartidos = await SharedAlbum.findAll({
    where: { viewer_id: req.user.idUser },
    include: [
      {
        model: Album,
        include: [{ model: User, as: "propietario", attributes: ["idUser","nombre", "foto"] }]
      },
      {
        model: User,
        as: "propietario",
        attributes: ["idUser","nombre", "foto"]
      } 
    ],
    order: [["created_at", "DESC"]],
  })

  res.render('perfil', { usuarioLogueado: req.user, user: usuario, albumesCompartidos });
};

const crearAlbumCompartido = async (ownerId, viewerId) => {
  try {

    const albumExistente = await SharedAlbum.findOne({
      where: {
        owner_id: ownerId,
        viewer_id: viewerId
      }
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

    return nuevoAlbum
  } catch (err) {
    console.error("Error al crear álbum compartido:", err)
    return null
  }
}

const verPerfilPublico = async (req, res) => {
  try {
    const userId = Number.parseInt(req.params.userId)
    const usuarioLogueado = req.user
    const usuario = await User.findByPk(userId, {
      attributes: ["idUser", "nombre", "email", "foto", "intereses", "antecedentes", "created_at"],
    })

    if (!usuario) {
      return res.status(404).send("Usuario no encontrado")
    }

    if (usuarioLogueado && usuarioLogueado.idUser === userId) {
      return res.redirect("/perfil")
    }

    let estadosRelacion = { yoLoSigo: false, elMeSigue: false, solicitudRecibida: false, solicitudEnviada: false }

    if (usuarioLogueado) {
      estadosRelacion = await obtenerEstadosRelacion(usuarioLogueado.idUser, userId)
    }

    const whereCondition = { user_id: userId }
    if (!usuarioLogueado) {
      whereCondition.is_public = true
    } else if (estadosRelacion.yoLoSigo) {

    } else {
      whereCondition.is_public = true
    }

    const albums = await Album.findAll({
      where: whereCondition,
      order: [["created_at", "DESC"]],
      raw: true,
    })
    usuario.albums = albums

    res.render("perfilPublico", {
      usuario,
      usuarioLogueado,
      estadosRelacion,
    })
  } catch (err) {
    console.error("Error al cargar perfil público:", err)
    res.status(500).send("Error interno al cargar perfil")
  }
}


const actualizarPerfil = async (req, res) => {
  try {
    const datos = {
      nombre: req.body.nombre,
      intereses: req.body.intereses,
      antecedentes: req.body.antecedentes
    };

    if (req.file && req.file.path) {
      datos.foto = req.file.path;
    }

    await User.update(datos, {
      where: { idUser: req.user.idUser }
    });

    res.redirect('/perfil');
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    res.status(500).send('Error al actualizar perfil');
  }
};

const obtenerEstadosRelacion = async (usuarioLogueado, otroUsuario) => {
  if (!usuarioLogueado || usuarioLogueado === otroUsuario) {
    return { yoLoSigo: null, elMeSigue: null, solicitudRecibida: null, solicitudEnviada: null }
  }

  const yoLoSigo = await FriendRequest.findOne({
    where: {
      from_user: usuarioLogueado,
      to_user: otroUsuario,
      status: "aceptada",
    },
  })

  const elMeSigue = await FriendRequest.findOne({
    where: {
      from_user: otroUsuario,
      to_user: usuarioLogueado,
      status: "aceptada",
    },
  })

  const solicitudRecibida = await FriendRequest.findOne({
    where: {
      from_user: otroUsuario,
      to_user: usuarioLogueado,
      status: "pendiente",
    },
  })

  const solicitudEnviada = await FriendRequest.findOne({
    where: {
      from_user: usuarioLogueado,
      to_user: otroUsuario,
      status: "pendiente",
    },
  })

  return {
    yoLoSigo: !!yoLoSigo,
    elMeSigue: !!elMeSigue,
    solicitudRecibida: !!solicitudRecibida,
    solicitudEnviada: !!solicitudEnviada,
  }
}
const cambiarContrasena = async (req, res) => {
  try {

    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ error: "Datos de formulario inválidos" })
    }

    const { contrasenaActual, nuevaContrasena, confirmarContrasena } = req.body
    const userId = req.user.idUser

    if (!contrasenaActual || !nuevaContrasena || !confirmarContrasena) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" })
    }

    if (!contrasenaActual.trim() || !nuevaContrasena.trim() || !confirmarContrasena.trim()) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" })
    }

    const usuario = await User.findByPk(userId)
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" })
    }

    const contrasenaValida = await bcrypt.compare(contrasenaActual, usuario.pwd_hash)
    if (!contrasenaValida) {
      return res.status(400).json({ error: "La contraseña actual es incorrecta" })
    }

    const esLaMismaContrasena = await bcrypt.compare(nuevaContrasena, usuario.pwd_hash)
    if (esLaMismaContrasena) {
      return res.status(400).json({ error: "La contraseña actual y la contraseña nueva son iguales" })
    }

    if (nuevaContrasena !== confirmarContrasena) {
      return res.status(400).json({ error: "Las nuevas contraseñas no coinciden" })
    }


    const nuevaContrasenaHash = await bcrypt.hash(nuevaContrasena, 10)

    await User.update({ pwd_hash: nuevaContrasenaHash }, { where: { idUser: userId } })

    res.status(200).json({ success: true, message: "Contraseña cambiada exitosamente" })
  } catch (err) {
    console.error("Error al cambiar contraseña:", err)
    res.status(500).json({ error: "Error interno del servidor" })
  }
}


module.exports = { verPerfil, verPerfilPublico, actualizarPerfil, obtenerEstadoRelacion, obtenerEstadosRelacion, crearAlbumCompartido, cambiarContrasena };