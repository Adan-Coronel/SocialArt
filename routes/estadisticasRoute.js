const express = require("express")
const router = express.Router()
const { verificarToken } = require("../middlewares/auth")
const { obtenerEstadisticasPerfil } = require("../controllers/estadisticasController")

router.get("/perfil", verificarToken, obtenerEstadisticasPerfil)

module.exports = router
