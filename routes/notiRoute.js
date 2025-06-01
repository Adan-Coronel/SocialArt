const express = require("express")
const router = express.Router()
const { verificarToken } = require("../middlewares/auth")
const {
  obtenerNotificacionesPendientes,
  verTodasLasNotificaciones,
  manejarAccionNotificacion,
  marcarComoLeida,
} = require("../controllers/notiController")
router.use(express.json())
router.get("/api/pendientes", verificarToken, obtenerNotificacionesPendientes)

router.get("/todas", verificarToken, verTodasLasNotificaciones)

router.post("/marcar-leida/:notificationId", verificarToken, marcarComoLeida)
router.post("/accion/:notificationId/:action", verificarToken, manejarAccionNotificacion)

module.exports = router
