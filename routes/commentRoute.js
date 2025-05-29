const express = require("express")
const router = express.Router()
const { verificarToken } = require("../middlewares/auth")
const { crearComentario, eliminarComentario, obtenerComentarios } = require("../controllers/commentController")
router.use(express.json())
router.post("/imagen/:imageId", verificarToken, crearComentario)
router.delete("/:id", verificarToken, eliminarComentario)
router.get("/imagen/:imageId", obtenerComentarios)

module.exports = router
