const { Image, Album, ImageVisibility, User, FriendRequest, SharedAlbum } = require("../models/indexModel")
const { Op } = require('sequelize');

const configurarVisibilidadImagen = async (req, res) => {
  try {
    const imageId = Number.parseInt(req.params.imageId)
    const userId = req.user.idUser
    const { usuariosPermitidos } = req.body
    const imagen = await Image.findByPk(imageId, {
      include: [
        {
          model: Album,
          where: { user_id: userId },
        },
      ],
    })

    if (!imagen) {
      return res.status(404).json({ error: "Imagen no encontrada o no tienes permisos" })
    }
    if (imagen.Album.is_public) {
      return res.status(400).json({
        error: "No puedes configurar visibilidad en álbumes públicos. Los álbumes públicos son visibles para todos.",
      })
    }

    await ImageVisibility.destroy({
      where: { image_id: imageId },
    })

 
    if (usuariosPermitidos && Array.isArray(usuariosPermitidos) && usuariosPermitidos.length > 0) {
      const configuraciones = usuariosPermitidos.map((usuarioId) => ({
        image_id: imageId,
        user_id: Number.parseInt(usuarioId),
        can_view: true,
      }))

      await ImageVisibility.bulkCreate(configuraciones)
   } else {
      await ImageVisibility.create({
        image_id: imageId,
        user_id: userId,
        can_view: false,
      })
     }
    res.json({
      success: true,
      message: "Visibilidad configurada correctamente",
    })
  } catch (err) {
    console.error("Error al configurar visibilidad:", err)
    res.status(500).json({ error: "Error interno al configurar visibilidad" })
  }
}


const obtenerConfiguracionVisibilidad = async (req, res) => {
  try {
    const imageId = Number.parseInt(req.params.imageId)
    const userId = req.user.idUser
    const imagen = await Image.findByPk(imageId, {
      include: [
        {
          model: Album,
          where: { user_id: userId },
        },
      ],
    })

    if (!imagen) {
      return res.status(404).json({ error: "Imagen no encontrada o no tienes permisos" })
    }
    if (imagen.Album.is_public) {
      return res.json({
        success: true,
        usuariosPermitidos: [],
        esPublico: false,
      })
    }

    const configuracion = await ImageVisibility.findAll({
      where: { image_id: imageId, can_view: true },
      attributes: ["user_id"],
    })

    const marcadorNadie = await ImageVisibility.findOne({
      where: {
        image_id: imageId,
        user_id:imagen.Album.user_id,
        can_view: false
      },
    })


    const usuariosPermitidos = configuracion.map((config) => config.user_id)
     res.json({
      success: true,
      usuariosPermitidos,
      esPublico: false,
      restriccionTotal: !!marcadorNadie,
    })
  } catch (err) {
    console.error("Error al obtener configuración:", err)
    res.status(500).json({ error: "Error interno" })
  }
}


const obtenerSeguidores = async (req, res) => {
  try {
    const userId = req.user.idUser

    const seguidores = await FriendRequest.findAll({
      where: {
        to_user: userId,
        status: "aceptada",
      },
      include: [
        {
          model: User,
          as: "emisor",
          attributes: ["idUser", "nombre", "foto"],
        },
      ],
    })
    const seguidoresUnicos = []
    const idsVistos = new Set()

    seguidores.forEach((seguidor) => {
      if (!idsVistos.has(seguidor.emisor.idUser)) {
        idsVistos.add(seguidor.emisor.idUser)
        seguidoresUnicos.push(seguidor.emisor)
      }
    })

    res.json({
      success: true,
      seguidores: seguidoresUnicos,
    })
  } catch (err) {
    console.error("Error al obtener seguidores:", err)
    res.status(500).json({ error: "Error interno al obtener seguidores" })
  }
}

const verConfiguracionVisibilidad = async (req, res) => {
  try {
    const albumId = req.params.albumId
    const userId = req.user.idUser

    const album = await Album.findOne({
      where: {
        idAlbum: albumId,
        user_id: userId,
      },
      include: [
        {
          model: Image,
          include: [
            {
              model: ImageVisibility,
              as: "visibilidad",
              include: [
                {
                  model: User,
                  attributes: ["idUser", "nombre"],
                },
              ],
            },
          ],
        },
      ],
    })

    if (!album) {
      return res.status(404).render("error", {
        titulo: "Álbum no encontrado",
        mensaje: "El álbum que buscas no existe o no tienes permisos para configurarlo.",
        botonTexto: "Volver al perfil",
        botonUrl: "/perfil",
        usuarioLogueado: req.user,
      })
    }
    if (album.is_public) {
      return res.status(400).render("error", {
        titulo: "Configuración no disponible",
        mensaje:
          "No puedes configurar visibilidad en álbumes públicos. Los álbumes públicos son visibles para todos los usuarios.",
        botonTexto: "Volver al álbum",
        botonUrl: `/albums/${albumId}`,
        usuarioLogueado: req.user,
      })
    }

    res.render("configurarVisibilidad", {
      album,
      usuarioLogueado: req.user,
    })
  } catch (err) {
    console.error("Error al cargar configuración de visibilidad:", err)
    res.status(500).render("error", {
      titulo: "Error interno",
      mensaje: "Ha ocurrido un error al cargar la configuración de visibilidad.",
      botonTexto: "Volver al perfil",
      botonUrl: "/perfil",
      usuarioLogueado: req.user,
    })
  }
}
const verificarVisibilidadImagen = async (imageId, userId) => {
  try {

    const imagen = await Image.findByPk(imageId, {
      include: [
        {
          model: Album,
          as: "Album",
        },
      ],
    })

    if (!imagen) {
      return false
    }

    if (imagen.Album.user_id === userId) {
      return true
    }
    if (imagen.Album.is_public) {
      return true
    }

    if (!userId) {
      return false
    }
    const marcadorNadie = await ImageVisibility.findOne({
      where: {
        image_id: imageId,
        user_id: 0,
      },
    })
    if (marcadorNadie) {
      return false
    }

    const configuracionesVisibilidad = await ImageVisibility.findAll({
      where: { image_id: imageId, can_view: false }
    })

    if (configuracionesVisibilidad.length === 0) {

      const esSeguidor = await FriendRequest.findOne({
        where: {
          from_user: userId,
          to_user: imagen.Album.user_id,
          status: "aceptada",
        },
      })
      return !!esSeguidor
    }


    const puedeVer = configuracionesVisibilidad.some((config) => config.user_id === userId && config.can_view)

    return puedeVer
  } catch (err) {
    console.error("Error al verificar visibilidad:", err)
    return false
  }
}
const configurarVisibilidadPorDefecto = async (propietarioId, seguidorId) => {
  try {

    const imagenes = await Image.findAll({
      include: [
        {
          model: Album,
          where: {
            user_id: propietarioId,
            is_public: false
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
    for (const imagen of imagenes) {

      const marcadorNadie = await ImageVisibility.findOne({
        where: {
          image_id: imagen.idImage,
          user_id: propietarioId,
          can_view: false
        },
      })

      if (marcadorNadie) {
        continue
      }
      const configuracionesExistentes = await ImageVisibility.findAll({
        where: { image_id: imagen.idImage, can_view: false }
      })

      if (configuracionesExistentes.length === 0) {
        await ImageVisibility.create({
          image_id: imagen.idImage,
          user_id: seguidorId,
          can_view: true,
        })
      }

      else {
        const configuracionExistente = configuracionesExistentes.find((config) => config.user_id === seguidorId)

        if (!configuracionExistente) {
          await ImageVisibility.create({
            image_id: imagen.idImage,
            user_id: seguidorId,
            can_view: true,
          })
        } 
      }
    }
    return true
  } catch (err) {
    console.error("Error al configurar visibilidad por defecto:", err)
    return false
  }
}
module.exports = {
  configurarVisibilidadImagen,
  obtenerSeguidores,
  verConfiguracionVisibilidad,
  obtenerConfiguracionVisibilidad,
  verificarVisibilidadImagen,
  configurarVisibilidadPorDefecto
}
