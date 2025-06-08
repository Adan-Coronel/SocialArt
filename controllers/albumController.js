const { Album, Image, User, Reaction, Tag, SharedAlbum } = require('../models/indexModel');
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
          {
            model: SharedAlbum,
            required: false,
          },
        ],
      }
    );

    if (!album) {
      return res.status(404).render("error", {
        titulo: "Álbum no encontrado",
        mensaje: "El álbum que buscas no existe.",
        botonTexto: "Volver al muro",
        botonUrl: "/muro",
        usuarioLogueado: req.user,
      })
    }

    const usuarioLogueado = req.user;
    const esPropietario = album.user_id === req.user?.idUser;
    const esPublico = album.is_public;

    const esAlbumCompartido = album.SharedAlbums && album.SharedAlbums.length > 0


    const imagenesParaMostrar = []
    let propietarioOriginal = null

    if (esAlbumCompartido) {
      const sharedAlbum = album.SharedAlbums[0]
      propietarioOriginal = await User.findByPk(sharedAlbum.owner_id, {
        attributes: ["idUser", "nombre", "foto"],
      })


      const imagenesDelPropietario = await Image.findAll({
        include: [
          {
            model: Album,
            where: { user_id: sharedAlbum.owner_id },
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
        order: [["created_at", "DESC"]],
      })


      for (const imagen of imagenesDelPropietario) {
        const puedeVer = await verificarVisibilidadImagen(imagen.idImage, usuarioLogueado?.idUser)
        if (puedeVer) {
          imagenesParaMostrar.push(imagen)
        }
      }


      album.propietario = propietarioOriginal
    }
    else {
      if (!esPropietario && !esPublico) {
        if (!usuarioLogueado) {
          return res.status(403).render("error", {
            titulo: "Acceso denegado",
            mensaje: "No tenés permiso para ver este álbum.",
            botonTexto: "Volver al muro",
            botonUrl: "/muro",
            usuarioLogueado: req.user,
          })
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
          return res.status(403).render("error", {
            titulo: "Acceso denegado",
            mensaje: "No tenés permiso para ver este álbum.",
            botonTexto: "Volver al muro",
            botonUrl: "/muro",
            usuarioLogueado: req.user,
          })
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

      for (const imagen of todasLasImagenes) {

        if (esPropietario) {
          imagenesParaMostrar.push(imagen)
        } else if (usuarioLogueado) {

          const puedeVer = await verificarVisibilidadImagen(imagen.idImage, usuarioLogueado.idUser)
          if (puedeVer) {
            imagenesParaMostrar.push(imagen)
          }
        } else {

          if (esPublico) {
            const puedeVer = await verificarVisibilidadImagen(imagen.idImage, null)
            if (puedeVer) {
              imagenesParaMostrar.push(imagen)
            }
          }
        }
      }
    }
    const imagenesConReacciones = [];

    for (const imagen of imagenesParaMostrar) {
      const reacciones = imagen.Reactions || []
      const totalReacciones = reacciones.length
      const usuarioReacciono = usuarioLogueado ? reacciones.some((r) => r.user_id === usuarioLogueado.idUser) : false
      imagenesConReacciones.push({
        ...imagen.toJSON(),
        totalReacciones,
        usuarioReacciono,
      })
    }
    res.render("album", {
      album,
      imagenes: imagenesConReacciones,
      usuarioLogueado: req.user,
      esAlbumCompartido,
      propietarioOriginal,
    })
  } catch (err) {
    console.error('Ves este error desde albumController.js desppues borrar. Error al cargar el álbum:', err);
    res.status(500).render("error", {
      titulo: "Error interno",
      mensaje: "Ha ocurrido un error al cargar el álbum.",
      botonTexto: "Volver al muro",
      botonUrl: "/muro",
      usuarioLogueado: req.user,
    })
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
    res.status(500).render("error", {
      titulo: "Error al crear álbum",
      mensaje: "Ha ocurrido un error al crear el álbum.",
      botonTexto: "Volver al perfil",
      botonUrl: "/perfil",
      usuarioLogueado: req.user,
    })
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
      return res.status(404).render("error", {
        titulo: "Álbum no encontrado",
        mensaje: "El álbum que intentas editar no existe o no tienes permisos para editarlo.",
        botonTexto: "Volver al perfil",
        botonUrl: "/perfil",
        usuarioLogueado: req.user,
      })
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
    res.status(500).render("error", {
      titulo: "Error al editar álbum",
      mensaje: "Ha ocurrido un error al editar el álbum.",
      botonTexto: "Volver al perfil",
      botonUrl: "/perfil",
      usuarioLogueado: req.user,
    })
  }
}

const eliminarAlbum = async (req, res) => {
  try {
    const album = await Album.findOne({
      where: {
        idAlbum: req.params.id,
        user_id: req.user.idUser
      }
    });
    if (!album) {
      return res.status(404).render("error", {
        titulo: "Álbum no encontrado",
        mensaje: "El álbum que intentas eliminar no existe o no tienes permisos para eliminarlo.",
        botonTexto: "Volver al perfil",
        botonUrl: "/perfil",
        usuarioLogueado: req.user,
      })
    }

    await album.destroy()
    res.redirect('/perfil');
  } catch (err) {
    console.error('Error al eliminar álbum:', err);
    res.status(500).render("error", {
      titulo: "Error al eliminar álbum",
      mensaje: "Ha ocurrido un error al eliminar el álbum.",
      botonTexto: "Volver al perfil",
      botonUrl: "/perfil",
      usuarioLogueado: req.user,
    })
  }
};

const verFormularioEditarAlbum = async (req, res) => {
  try {
    const albumId = req.params.id
    const userId = req.user.idUser

    const album = await Album.findOne({
      where: {
        idAlbum: albumId,
        user_id: userId,
      },
      include: [
        {
          model: Tag,
          attributes: ["idTag", "nombreTag"],
        },
        {
          model: SharedAlbum,
          required: false,
        },
      ],
    })

    if (!album) {
      return res.status(404).render("error", {
        titulo: "Álbum no encontrado",
        mensaje: "El álbum que intentas editar no existe o no tienes permisos para editarlo.",
        botonTexto: "Volver a mi perfil",
        botonUrl: "/perfil",
        usuarioLogueado: req.user,
      })
    }

    const esAlbumCompartido = album.SharedAlbums && album.SharedAlbums.length > 0

    if (esAlbumCompartido) {
      return res.status(403).render("error", {
        titulo: "No se puede editar",
        mensaje: "No puedes editar álbumes compartidos.",
        botonTexto: "Volver a mi perfil",
        botonUrl: "/perfil",
        usuarioLogueado: req.user,
      })
    }
    const imagenes = await Image.findAll({
      where: { album_id: albumId },
      order: [["created_at", "DESC"]],
    })

    res.render("editarAlbum", {
      album,
      imagenes,
      usuarioLogueado: req.user,
    })
  } catch (err) {
    console.error("Error al cargar formulario de edición:", err)
    res.status(500).render("error", {
      titulo: "Error interno",
      mensaje: "Ha ocurrido un error al cargar el formulario de edición.",
      botonTexto: "Volver a mi perfil",
      botonUrl: "/perfil",
      usuarioLogueado: req.user,
    })
  }
}
module.exports = { verAlbum, crearAlbum, eliminarAlbum, editarAlbum, verFormularioEditarAlbum };