const { Image, Album, ImageVisibility, User, FriendRequest } = require("../models/indexModel")

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

    await ImageVisibility.destroy({
      where: { image_id: imageId },
    })
    if (usuariosPermitidos && usuariosPermitidos.length > 0) {
      const configuraciones = usuariosPermitidos.map((usuarioId) => ({
        image_id: imageId,
        user_id: Number.parseInt(usuarioId),
        can_view: true,
      }))

      await ImageVisibility.bulkCreate(configuraciones)
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

    const configuracion = await ImageVisibility.findAll({
      where: { image_id: imageId },
      attributes: ["user_id"],
    })

    const usuariosPermitidos = configuracion.map((config) => config.user_id)

    res.json({
      success: true,
      usuariosPermitidos,
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

    res.json({
      success: true,
      seguidores: seguidores.map((s) => s.emisor),
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
      return res.status(404).send("Álbum no encontrado")
    }

    res.render("configurarVisibilidad", {
      album,
      usuarioLogueado: req.user,
    })
  } catch (err) {
    console.error("Error al cargar configuración de visibilidad:", err)
    res.status(500).send("Error interno")
  }
}
const verificarVisibilidadImagen = async (imageId, userId) => {
  try {
    
    if (!userId) {
      return false
    }

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

    const configuracionesVisibilidad = await ImageVisibility.findAll({
      where: { image_id: imageId },
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

module.exports = {
  configurarVisibilidadImagen,
  obtenerSeguidores,
  verConfiguracionVisibilidad,
  obtenerConfiguracionVisibilidad,
  verificarVisibilidadImagen
}
