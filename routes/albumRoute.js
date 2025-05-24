const express = require('express');
const router = express.Router();
const Album = require('../models/albumModel');
const Image = require('../models/imageModel');

router.get('/:id', async (req, res) => {
  const album = await Album.findByPk(req.params.id);
  const images = await Image.findAll({ where: { album_id: req.params.id} });

  res.render('album', { album, images });
});

module.exports = router;
