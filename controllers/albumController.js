const { Album, Image, User, Reaction, Tag } = require('../models/indexModel');
const { verificarVisibilidadImagen } = require("./visibilidadController")
const verAlbum = async (req, res) => {
  try {

    const album = await Album.findByPk(req.params.id,
      {
        include: [
          {
            model: User,
            as: "propietario",
            attributes: ["idUser", "nombre", "foto"],
          },
          {
            model: Tag,
            attributes: ["idTag", "nombreTag"],
          },
        ],
      }
    );

    if (!album) {
      return res.status(404).send('Álbum no encontrado');
    }

    const usuarioLogueado = req.user;
    const esPropietario = album.user_id === req.user?.idUser;
    const esPublico = album.is_public;

    if (!esPropietario && !esPublico) {
      if (!usuarioLogueado) {
        return res.status(403).send("No tenés permiso para ver este álbum")
      }
      const { FriendRequest } = require("../models/indexModel");
      const solicitudAceptada = await FriendRequest.findOne({
        where: {
          from_user: usuarioLogueado.idUser,
          to_user: album.user_id,
          status: "aceptada"
        }
      });

      if (!solicitudAceptada) {
        return res.status(403).send("No tenés permiso para ver este álbum")
      }
    }

    const todasLasImagenes = await Image.findAll({
      where: { album_id: album.idAlbum },
      include: [
        {
          model: Reaction,
          attributes: ["user_id"],
        },
      ],
    })

    const imagenesVisibles = []
    for (const imagen of todasLasImagenes) {

      if (esPropietario) {
        imagenesVisibles.push(imagen)
      } else if (usuarioLogueado) {

        const puedeVer = await verificarVisibilidadImagen(imagen.idImage, usuarioLogueado.idUser)
        if (puedeVer) {
          imagenesVisibles.push(imagen)
        }
      } else {

        if (esPublico) {
          const puedeVer = await verificarVisibilidadImagen(imagen.idImage, null)
          if (puedeVer) {
            imagenesVisibles.push(imagen)
          }
        }
      }
    }
    const imagenesConReacciones = imagenesVisibles.map((imagen) => {
      const totalReacciones = imagen.Reactions ? imagen.Reactions.length : 0
      const usuarioReacciono = usuarioLogueado
        ? imagen.Reactions?.some((r) => r.user_id === usuarioLogueado.idUser)
        : false

      return {
        ...imagen.toJSON(),
        totalReacciones,
        usuarioReacciono,
      }
    });
    res.render("album", {
      album,
      imagenes: imagenesConReacciones,
      usuarioLogueado: req.user,
    })
  } catch (err) {
    console.error('Ves este error desde albumController.js desppues borrar. Error al cargar el álbum:', err);
    res.status(500).send('Error interno al cargar el álbum');
  }


};

const crearAlbum = async (req, res) => {
  try {
    const album = await Album.create({
      user_id: req.user.idUser,
      titulo: req.body.titulo,
      is_public: !!req.body.is_public
    });

    if (req.body.tags && req.body.tags.length > 0) {
      const tagsSeleccionadas = req.body.tags.slice(0, 5);
      const tags = await Tag.findAll({
        where: { idTag: tagsSeleccionadas },
      })
      await album.addTags(tags)
    }
    res.redirect('/perfil');
  } catch (err) {
    console.error('Error al crear álbum:', err);
    res.status(500).send('Error al crear álbum');
  }
};

const editarAlbum = async (req, res) => {
  try {
    const albumId = req.params.id
    const { titulo, is_public, tags } = req.body

    const album = await Album.findOne({
      where: {
        idAlbum: albumId,
        user_id: req.user.idUser,
      },
    })

    if (!album) {
      return res.status(404).send("Álbum no encontrado")
    }

    await album.update({
      titulo,
      is_public: !!is_public,
    })

    if (tags) {
      const tagsSeleccionadas = Array.isArray(tags) ? tags.slice(0, 5) : [tags].slice(0, 5)
      const tagsModels = await Tag.findAll({
        where: { idTag: tagsSeleccionadas },
      })
      await album.setTags(tagsModels)
    } else {
      await album.setTags([])
    }

    res.redirect("/perfil")
  } catch (err) {
    console.error("Error al editar álbum:", err)
    res.status(500).send("Error al editar álbum")
  }
}

const eliminarAlbum = async (req, res) => {
  try {
    await Album.destroy({
      where: {
        idAlbum: req.params.id,
        user_id: req.user.idUser
      }
    });
    res.redirect('/perfil');
  } catch (err) {
    console.error('Error al eliminar álbum:', err);
    res.status(500).send('Error al eliminar álbum');
  }
};


module.exports = { verAlbum, crearAlbum, eliminarAlbum, editarAlbum };