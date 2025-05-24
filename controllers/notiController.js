const Comment = require('../models/commentModel.js');

async function obtenerComentarioPorId(id) {
  const comentario = await Comment.findByPk(id);
  return comentario;
}
