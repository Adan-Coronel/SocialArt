const express = require("express")
const router = express.Router()
const { verificarToken, verificarTokenOpcional } = require("../middlewares/auth")
const { toggleReaction, obtenerReacciones } = require("../controllers/reactionController")

router.use(express.json())

router.post("/imagen/:imageId", verificarToken, toggleReaction)
router.get("/imagen/:imageId", verificarTokenOpcional, obtenerReacciones)

module.exports = router
