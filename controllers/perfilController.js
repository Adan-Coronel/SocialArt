const { User, Album, FriendRequest } = require('../models/indexModel');


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
  console.log('req.user:', req.user);
  if (!req.user) return res.redirect('/');

  const usuario = await User.findByPk(req.user.idUser, {
    include: [{ model: Album, as: 'albums' }]
  });

  if (!usuario) return res.redirect('/');

  res.render('perfil', { usuarioLogueado: req.user,user: usuario });
};

const verPerfilPublico = async (req, res) => {
  try {
    const userId = Number.parseInt(req.params.userId)
    const usuarioLogueado = req.user

    const usuario = await User.findByPk(userId, {
      include: [
        {
          model: Album,
          as: "albums",
          where: { is_public: true }, // Solo álbumes públicos
          required: false,
        },
      ],
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

     if (!usuarioLogueado || !estadosRelacion.yoLoSigo) {
       whereCondition.is_public = true
     }
    
    const albums = await Album.findAll({
      where: whereCondition,
      order: [["created_at", "DESC"]],
    });
    usuario.dataValues.albums = albums;
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
      intereses: req.body.intereses
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
    return { yoLoSigo: null, elMeSigue: null, solicitudRecibida: null }
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

module.exports={ verPerfil, verPerfilPublico, actualizarPerfil, obtenerEstadosRelacion };