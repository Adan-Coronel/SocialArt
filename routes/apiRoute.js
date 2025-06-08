const express = require("express")
const router = express.Router()
const { verificarToken } = require("../middlewares/auth")
const { obtenerSiguiendo } = require("../controllers/apiController")

router.get("/siguiendo", verificarToken, obtenerSiguiendo)

module.exports = router