const { Album, Image, User, FriendRequest } = require("../models/indexModel");
const { Op } = require("sequelize");

async function verMuro(req, res) {
  try {
    let albumesPublicos = [];
    let albumesAmigos = [];
    let usuarioLogueado = req.user;

    // Álbumes públicos (modo vitrina)

    let filtroVitrina = {
      is_public: true
    };

    // NO se incluyen sus propios álbumes
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


    // Álbumes privados de amigos
    if (usuarioLogueado) {
      let solicitudesAceptadas = await FriendRequest.findAll({
        where: {
          from_user: usuarioLogueado.idUser,
          status: "aceptada"
        }
      });

      //  solo los IDde los amigos
      let idsAmigos = [];

      for (let i = 0; i < solicitudesAceptadas.length; i++) {
        idsAmigos.push(solicitudesAceptadas[i].to_user);
      }

      if (idsAmigos.length > 0) {
        let albumesDeAmigos = await Album.findAll({
          where: {
            user_id: { [Op.in]: idsAmigos },
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
              limit: 1,
              order: [["created_at", "DESC"]]
            }
          ],
          order: [["created_at", "DESC"]]
        });

        albumesAmigos = albumesDeAmigos;
      }
    }


    let todosLosAlbumes = albumesPublicos.concat(albumesAmigos);

    //  (de más nuevo a más viejo)
    todosLosAlbumes.sort(function(a, b) {
      return new Date(b.created_at) - new Date(a.created_at);
    });

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
