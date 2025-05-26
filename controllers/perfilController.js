const { User, Album } = require('../models/indexModel');

const verPerfil = async (req, res) => {
  console.log('req.user:', req.user);
  if (!req.user) return res.redirect('/');

  const usuario = await User.findByPk(req.user.idUser, {
    include: [{ model: Album, as: 'albums' }]
  });

  if (!usuario) return res.redirect('/');

  res.render('perfil', { usuarioLogueado: req.user,user: usuario });
};
const actualizarPerfil = async (req, res) => {
  try {
    const datos = {
      nombre: req.body.nombre,
      intereses: req.body.intereses
    };

    if (req.file && req.file.path) {
      datos.foto = req.file.path; 
    }

    await User.update(datos, {
      where: { idUser: req.user.idUser }
    });

    res.redirect('/perfil');
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    res.status(500).send('Error al actualizar perfil');
  }
};
module.exports={ verPerfil, actualizarPerfil };