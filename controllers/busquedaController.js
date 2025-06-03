const { User, Album, Image, Tag } = require('../models/indexModel');
const { Op } = require('sequelize');

async function buscarContenido(req, res) {
  const query = req.query.q;
  const tipo = req.query.tipo || "todo";
  const usuarioLogueado = req.user;
  if (!query || query.trim() === "") {
    return res.render('busqueda', {
      resultados: {
        usuarios: [],
        albumes: [],
        imagenes: []
      },
      query: '',
      tipo,
      usuarioLogueado
    });
  }

  const resultados = { usuarios: [], albumes: [], imagenes: [] }

  try {
    if (tipo === "usuarios" || tipo === "todo") {
      resultados.usuarios = await User.findAll({
        where: {
          [Op.or]: [
            { nombre: { [Op.like]: `%${query}%` } },
            { email: { [Op.like]: `%${query}%` } }
          ],
          ...(usuarioLogueado && { idUser: { [Op.ne]: usuarioLogueado.idUser } }),
        },
        attributes: ['idUser', 'nombre', 'email', 'foto'],
        limit: 10,
      });
    }
    if (tipo === "albumes" || tipo === "todo") {
      const whereAlbum = {
        [Op.or]: [{ titulo: { [Op.like]: `%${query}%` } }],
      }

      if (!usuarioLogueado) {
        whereAlbum.is_public = true
      }

      resultados.albumes = await Album.findAll({
        where: whereAlbum,
        include: [
          {
            model: User,
            as: "propietario",
            attributes: ["idUser", "nombre", "foto"],
          },
          {
            model: Tag,
            where: {
              nombreTag: { [Op.like]: `%${query}%` },
            },
            required: false,
          },
          {
            model: Image,
            limit: 1,
            order: [["created_at", "DESC"]],
            required: false,
          },
        ],
        limit: 10,
        order: [["created_at", "DESC"]],
      })
    }

    if (tipo === "todo" || tipo === "tags") {
      const albumesPorTags = await Album.findAll({
        include: [
          {
            model: Tag,
            where: {
              nombreTag: { [Op.like]: `%${query}%` },
            },
          },
          {
            model: User,
            as: "propietario",
            attributes: ["idUser", "nombre", "foto"],
          },
          {
            model: Image,
            limit: 1,
            order: [["created_at", "DESC"]],
            required: false,
          },
        ],
        where: usuarioLogueado ? {} : { is_public: true },
        limit: 5,
        order: [["created_at", "DESC"]],
      })


      const idsExistentes = resultados.albumes.map((a) => a.idAlbum)
      albumesPorTags.forEach((album) => {
        if (!idsExistentes.includes(album.idAlbum)) {
          resultados.albumes.push(album)
        }
      })
    }
  } catch (error) {
    console.error("Error en búsqueda:", error)
  }
  res.render("busqueda", { resultados, query, tipo, usuarioLogueado })
}

module.exports = { buscarContenido };
