const { Album, Image } = require('../models/indexModel');

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

    const album = await Album.findByPk(req.params.id);

    if (!album) {
      return res.status(404).send('Álbum no encontrado');
    }

    const esPropietario = album.user_id === req.user?.idUser;
    const esPublico = album.is_public;

    if (!esPropietario && !esPublico) {
      return res.status(403).send('No tenés permiso para ver este álbum');
    }
    const imagenes = await Image.findAll({ where: { album_id: album.idAlbum } })

    res.render('album', { usuarioLogueado: req.user, album, imagenes });
  } catch (err) {
    console.error('Ves este error desde albumController.js desppues borrar. Error al cargar el álbum:', err);
    res.status(500).send('Error interno al cargar el álbum');
  }


};


//CRUD

const crearAlbum = async (req, res) => {
  try {
    await Album.create({
      user_id: req.user.idUser,
      titulo: req.body.titulo,
      is_public: !!req.body.is_public
    });
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