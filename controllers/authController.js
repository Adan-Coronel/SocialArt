const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/indexModel');
require('dotenv').config();
const registrarUsuario = async (req, res) => {
    const { nombreUsuario, usuarioMail, usuarioContraseña, vUsuarioContraseña } = req.body;

    if (usuarioContraseña !== vUsuarioContraseña) {
        return res.render('index', {
            errorRegistro: 'Las contraseñas no coinciden',
            errorLogin: null
        });
    }

    try {
        const yaExiste = await User.findOne({ where: { email: usuarioMail } });
        if (yaExiste) {
            return res.render('index', {
                errorRegistro: 'Ese email ya está registrado',
                errorLogin: null
            });
        }

        const hashed = await bcrypt.hash(usuarioContraseña, 10);
        await User.create({
            nombre: nombreUsuario,
            email: usuarioMail,
            pwd_hash: hashed
        });

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error interno');
    }
};

const loginUsuario = async (req, res) => {
    const { usuarioMail, usuarioContraseña } = req.body;

    try {
        const user = await User.findOne({ where: { email: usuarioMail } });

        if (!user) {
            return res.render('index', {
                errorLogin: 'Usuario no encontrado',
                errorRegistro: null
            });
        }

        if (!user || !user.pwd_hash) {
            return res.render('index', {
                errorLogin: 'Email o contraseña inválidos',
                errorRegistro: null
            });
        }
        const valid = await bcrypt.compare(usuarioContraseña, user.pwd_hash);
        if (!valid) {
            return res.render('index', {
                errorLogin: 'Contraseña incorrecta',
                errorRegistro: null
            });
        }

        const token = jwt.sign({ id: user.idUser }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/perfil');
    } catch (err) {
        console.error('Ves este error desde authController.js desppues borrar.', err);
        res.status(500).send('Error interno');
    }
};

module.exports = { registrarUsuario, loginUsuario };
