const { Album, Image, User, Reaction, Tag } = require('../models/indexModel');

const verAlbumes = async(req, res)=>{

  const albums = await Album.findAll({
    where: { user_id: req.user.idUser },
    include: [{
      model: Image,
      limit: 1,
      order: [['created_at', 'DESC']]
    }],
    order: [['created_at', 'DESC']]
  });

  res.render('mis_albums', { usuarioLogueado: req.user, albums });

}
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
        }});
     
    if (!solicitudAceptada) {
        return res.status(403).send("No tenés permiso para ver este álbum")
      }
    }
    
    const imagenes = await Image.findAll({
      where: { album_id: album.idAlbum },
      include: [
        {
          model: Reaction,
          attributes: ["user_id"],
        },
      ],
    })

    const imagenesConReacciones = imagenes.map((imagen) => {
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
    const album =await Album.create({
      user_id: req.user.idUser,
      titulo: req.body.titulo,
      is_public: !!req.body.is_public
    });
    if (req.body.tags && req.body.tags.length > 0) {
      const tags = await Tag.findAll({
        where: { idTag: req.body.tags },
      })
      await album.addTags(tags)
    }
    res.redirect('/perfil');
  } catch (err) {
    console.error('Error al crear álbum:', err);
    res.status(500).send('Error al crear álbum');
  }
};

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


module.exports = { verAlbum, verAlbumes, crearAlbum, eliminarAlbum };