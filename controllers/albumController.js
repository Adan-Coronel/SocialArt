const Album = require('../models/albumModel');
const Image = require('../models/imageModel');

const verAlbum = async (req, res) => {
  const album = await Album.findByPk(req.params.id);
  const imagenes = await Image.findAll({ where: { album_id: req.params.id } });

  res.render('album', { album, imagenes });
};
