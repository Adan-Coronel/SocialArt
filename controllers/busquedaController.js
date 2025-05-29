const { User } = require('../models/indexModel');
const { Op } = require('sequelize');

async function buscarUsuarios(req, res) {
  const query = req.query.q;
  const usuarioLogueado = req.user
  if (!query || query.trim() === "") {
    return res.render('busqueda', { resultados: [], query: '', usuarioLogueado });
  }

  const resultados = await User.findAll({
    where: {
      [Op.or]: [
        { nombre: { [Op.like]: `%${query}%` } },
        { email: { [Op.like]: `%${query}%` } }
      ],
      ...(usuarioLogueado && { idUser: { [Op.ne]: usuarioLogueado.idUser } }),
    },
    attributes: ['idUser', 'nombre', 'email','foto'],
    limit: 20
  });

  res.render('busqueda', { resultados, query, usuarioLogueado });
}

module.exports = { buscarUsuarios };
