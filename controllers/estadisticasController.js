const { User, Album, Image, Comment, Reaction, SharedAlbum } = require("../models/indexModel")
const { Op } = require("sequelize");
const sequelize = require("../config/db");
const obtenerEstadisticasPerfil = async (req, res) => {
  try {
    const userId = req.user.idUser
    const [albumesResult] = await sequelize.query(
      `
      SELECT COUNT(*) as count 
      FROM albums a 
      LEFT JOIN shared_albums sa ON a.idAlbum = sa.album_id 
      WHERE a.user_id = :userId AND sa.album_id IS NULL
    `,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      },
    )
    const totalAlbumes = albumesResult.count

    const [imagenesResult] = await sequelize.query(
      `
      SELECT COUNT(*) as count 
      FROM imagenes i 
      INNER JOIN albums a ON i.album_id = a.idAlbum 
      LEFT JOIN shared_albums sa ON a.idAlbum = sa.album_id 
      WHERE a.user_id = :userId AND sa.album_id IS NULL
    `,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      },
    )
    const totalImagenes = imagenesResult.count

    const [comentariosResult] = await sequelize.query(
      `
      SELECT COUNT(*) as count 
      FROM comments c 
      INNER JOIN imagenes i ON c.image_id = i.idImage 
      INNER JOIN albums a ON i.album_id = a.idAlbum 
      LEFT JOIN shared_albums sa ON a.idAlbum = sa.album_id 
      WHERE a.user_id = :userId AND sa.album_id IS NULL
    `,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      },
      )
    const totalComentariosRecibidos = comentariosResult.count

    const [reaccionesResult] = await sequelize.query(
      `
      SELECT COUNT(*) as count 
      FROM reactions r 
      INNER JOIN imagenes i ON r.image_id = i.idImage 
      INNER JOIN albums a ON i.album_id = a.idAlbum 
      LEFT JOIN shared_albums sa ON a.idAlbum = sa.album_id 
      WHERE a.user_id = :userId AND sa.album_id IS NULL
    `,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      },
    )
    const totalReaccionesRecibidas = reaccionesResult.count

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
        LEFT JOIN shared_albums sa ON a.idAlbum = sa.album_id
        WHERE a.user_id = :userId AND sa.album_id IS NULL
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
    const fechaLimiteStr = fechaLimite.toISOString().slice(0, 19).replace("T", " ")

    const [imagenesRecientesResult] = await sequelize.query(
      `
      SELECT COUNT(*) as count 
      FROM imagenes i 
      INNER JOIN albums a ON i.album_id = a.idAlbum 
      LEFT JOIN shared_albums sa ON a.idAlbum = sa.album_id 
      WHERE a.user_id = :userId AND sa.album_id IS NULL AND i.created_at >= :fechaLimite
    `,
      {
        replacements: { userId, fechaLimite: fechaLimiteStr },
        type: sequelize.QueryTypes.SELECT,
      },
    )

    const [comentariosRecientesResult] = await sequelize.query(
      `
      SELECT COUNT(*) as count 
      FROM comments c 
      INNER JOIN imagenes i ON c.image_id = i.idImage 
      INNER JOIN albums a ON i.album_id = a.idAlbum 
      LEFT JOIN shared_albums sa ON a.idAlbum = sa.album_id 
      WHERE a.user_id = :userId AND sa.album_id IS NULL AND c.created_at >= :fechaLimite
    `,
      {
        replacements: { userId, fechaLimite: fechaLimiteStr },
        type: sequelize.QueryTypes.SELECT,
      },
    )

    const [reaccionesRecientesResult] = await sequelize.query(
      `
      SELECT COUNT(*) as count 
      FROM reactions r 
      INNER JOIN imagenes i ON r.image_id = i.idImage 
      INNER JOIN albums a ON i.album_id = a.idAlbum 
      LEFT JOIN shared_albums sa ON a.idAlbum = sa.album_id 
      WHERE a.user_id = :userId AND sa.album_id IS NULL AND r.created_at >= :fechaLimite
    `,
      {
        replacements: { userId, fechaLimite: fechaLimiteStr },
        type: sequelize.QueryTypes.SELECT,
      },
    )

    const actividadReciente = {
      imagenesSubidas: imagenesRecientesResult.count,
      comentariosRecibidos: comentariosRecientesResult.count,
      reaccionesRecibidas: reaccionesRecientesResult.count,
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
