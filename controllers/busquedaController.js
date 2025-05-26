const { User } = require('../models/indexModel');
const { Op } = require('sequelize');

async function buscarUsuarios(req, res) {
  const query = req.query.q;

  if (!query) {
    return res.render('busqueda', { resultados: [], query: '', usuarioLogueado: req.user });
  }

  const resultados = await User.findAll({
    where: {
      [Op.or]: [
        { nombre: { [Op.like]: `%${query}%` } },
        { email: { [Op.like]: `%${query}%` } }
      ]
    },
    attributes: ['idUser', 'nombre', 'foto']
  });

  res.render('busqueda', { resultados, query, usuarioLogueado: req.user });
}

module.exports = { buscarUsuarios };
