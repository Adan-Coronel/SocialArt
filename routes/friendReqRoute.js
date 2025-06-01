const express = require("express")
const router = express.Router()
const { verificarToken } = require("../middlewares/auth")
const {
  enviarSolicitud,
  aceptarSolicitud,
  rechazarSolicitud,
  cancelarSolicitud,
  dejarDeSeguir,
  cancelarSeguimiento
} = require("../controllers/friendReqController")
router.use(express.json())
// enviar soli
router.post("/enviar/:idUser", verificarToken, enviarSolicitud)
// aceptar soli
router.post("/aceptar/:id", verificarToken, aceptarSolicitud)
// rechazar soli
router.post("/rechazar/:id", verificarToken, rechazarSolicitud)
// cancelar soli
router.post("/cancelar/:idUser", verificarToken, cancelarSolicitud)
//dejar de seguir unidireccional
router.post("/dejar-seguir/:idUser", verificarToken, dejarDeSeguir)
router.post("/cancelar-seguimiento/:idUser", verificarToken, cancelarSeguimiento)

module.exports = router
