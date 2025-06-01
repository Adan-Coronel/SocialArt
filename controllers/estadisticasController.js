const { User, Album, Image, Comment, Reaction } = require("../models/indexModel")
const { Op } = require("sequelize");
const sequelize = require("../config/db");
const obtenerEstadisticasPerfil = async (req, res) => {
  try {
    const userId = req.user.idUser

    const totalAlbumes = await Album.count({
      where: { user_id: userId },
    })

    const totalImagenes = await Image.count({
      include: [
        {
          model: Album,
          where: { user_id: userId },
        },
      ],
    })

    const totalComentariosRecibidos = await Comment.count({
      include: [
        {
          model: Image,
          include: [
            {
              model: Album,
              where: { user_id: userId },
            },
          ],
        },
      ],
    })

    const totalReaccionesRecibidas = await Reaction.count({
      include: [
        {
          model: Image,
          include: [
            {
              model: Album,
              where: { user_id: userId },
            },
          ],
        },
      ],
    })

    let albumMasPopular = null
    try {
      const [results] = await sequelize.query(
        `
        SELECT 
          a.idAlbum,
          a.titulo,
          COUNT(r.idReaction) as totalReacciones
        FROM albums a
        LEFT JOIN imagenes i ON a.idAlbum = i.album_id
        LEFT JOIN reactions r ON i.idImage = r.image_id
        WHERE a.user_id = :userId
        GROUP BY a.idAlbum, a.titulo
        HAVING COUNT(r.idReaction) > 0
        ORDER BY totalReacciones DESC
        LIMIT 1
      `,
        {
          replacements: { userId },
          type: sequelize.QueryTypes.SELECT,
        },
      )

      if (results && results.length > 0) {
        albumMasPopular = results[0]
      }
    } catch (albumError) {
      console.error("Error al obtener álbum más popular:", albumError)
      
    }
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() - 30)

    const actividadReciente = {
      imagenesSubidas: await Image.count({
        include: [
          {
            model: Album,
            where: { user_id: userId },
          },
        ],
        where: {
          created_at: { [Op.gte]: fechaLimite },
        },
      }),
      comentariosRecibidos: await Comment.count({
        include: [
          {
            model: Image,
            include: [
              {
                model: Album,
                where: { user_id: userId },
              },
            ],
          },
        ],
        where: {
          created_at: { [Op.gte]: fechaLimite },
        },
      }),
      reaccionesRecibidas: await Reaction.count({
        include: [
          {
            model: Image,
            include: [
              {
                model: Album,
                where: { user_id: userId },
              },
            ],
          },
        ],
        where: {
          created_at: { [Op.gte]: fechaLimite },
        },
      }),
    }

    const estadisticas = {
      totalAlbumes,
      totalImagenes,
      totalComentariosRecibidos,
      totalReaccionesRecibidas,
      albumMasPopular: albumMasPopular || null,
      actividadReciente,
    }

    res.json({
      success: true,
      estadisticas,
    })
  } catch (err) {
    console.error("Error al obtener estadísticas:", err)
    res.status(500).json({ error: "Error interno al obtener estadísticas" })
  }
}

module.exports = {
  obtenerEstadisticasPerfil,
}
