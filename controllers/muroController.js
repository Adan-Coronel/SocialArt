const { Album, Image, User, FriendRequest } = require("../models/indexModel");
const { Op } = require("sequelize");

async function verMuro(req, res) {
  try {
    let albumesPublicos = [];
    let albumesPrivadosDeSeguidos = []
    let usuarioLogueado = req.user;

    let filtroVitrina = {
      is_public: true
    };

    if (usuarioLogueado) {
      filtroVitrina.user_id = { [Op.ne]: usuarioLogueado.idUser };
    }

    let albumesVitrina = await Album.findAll({
      where: filtroVitrina,
      include: [
        {
          model: User,
          as: "propietario",
          attributes: ["idUser", "nombre", "foto"]
        },
        {
          model: Image,
          limit: 1,
          order: [["created_at", "DESC"]]
        }
      ],
      order: [["created_at", "DESC"]]
    });

    albumesPublicos = albumesVitrina;

    if (usuarioLogueado) {
      const seguidos = await FriendRequest.findAll({
        where: {
          from_user: usuarioLogueado.idUser,
          status: "aceptada",
        }
      });

      let idsSeguidos = seguidos.map((solicitud) => solicitud.to_user)

      if (idsSeguidos.length > 0) {
        let albumesDeUsuariosSeguidos = await Album.findAll({
          where: {
            user_id: { [Op.in]: idsSeguidos },
            is_public: false
          },
          include: [
            {
              model: User,
              as: "propietario",
              attributes: ["idUser", "nombre", "foto"]
            },
            {
              model: Image,
              limit: 3,
              order: [["created_at", "DESC"]]
            }
          ],
          order: [["created_at", "DESC"]]
        });

        albumesPrivadosDeSeguidos = albumesDeUsuariosSeguidos;

      }
    }


    const todosLosAlbumes = [...albumesPublicos, ...albumesPrivadosDeSeguidos].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    )

    res.render("muro", {
      albumes: todosLosAlbumes,
      usuarioLogueado: usuarioLogueado,
      esMuroGeneral: true
    });

  } catch (err) {
    console.error("Borrar dps : ver muroController.js Error al cargar el muro:", err);
    res.status(500).send("Error interno al cargar el muro");
  }
}

module.exports = {
  verMuro
};
