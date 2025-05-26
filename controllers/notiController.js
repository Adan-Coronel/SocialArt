const { Comment } = require('../models/indexModel');

async function obtenerComentarioPorId(id) {
  const comentario = await Comment.findByPk(id);
  return comentario;
}
