const { User, Album, Image, Tag, SharedAlbum } = require('../models/indexModel');
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
    if ((tipo === "usuarios" || tipo === "todo") && usuarioLogueado) {
      resultados.usuarios = await User.findAll({
        where: {
          [Op.or]: [
            { nombre: { [Op.like]: `%${query}%` } },
            { email: { [Op.like]: `%${query}%` } }
          ],
          idUser: { [Op.ne]: usuarioLogueado.idUser },
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
          {
            model: SharedAlbum,
           as: "SharedAlbums",
            required: false,
          }
        ],
        limit: 10,
        order: [["created_at", "DESC"]],
      })
      resultados.albumes = resultados.albumes.filter((album) => !album.SharedAlbums || album.SharedAlbums.length === 0)
    }

    if (tipo === "todo" || tipo === "tags") {
      const whereTagAlbum = usuarioLogueado ? {} : { is_public: true }
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
          {
            model: SharedAlbum,
             as: "SharedAlbums",
            required: false,
          }
        ],
        where: whereTagAlbum,
        limit: 5,
        order: [["created_at", "DESC"]],
      })

      const albumesFiltrados = albumesPorTags.filter((album) => !album.SharedAlbums || album.SharedAlbums.length === 0)
      const idsExistentes = resultados.albumes.map((a) => a.idAlbum)
      albumesFiltrados.forEach((album) => {
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
