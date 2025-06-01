const express = require("express")
const router = express.Router()
const { verificarToken } = require("../middlewares/auth")
const {
  configurarVisibilidadImagen,
  obtenerSeguidores,
  verConfiguracionVisibilidad,
} = require("../controllers/visibilidadController")

router.use(express.json())

router.get("/:albumId", verificarToken, verConfiguracionVisibilidad)
router.post("/imagen/:imageId", verificarToken, configurarVisibilidadImagen)
router.get("/api/seguidores", verificarToken, obtenerSeguidores)

module.exports = router
