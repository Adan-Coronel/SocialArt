const express = require("express")
const router = express.Router()
const { verificarToken } = require("../middlewares/auth")
const { verSeguidores, verSiguiendo } = require("../controllers/seguidoresController")

router.get("/:userId", verificarToken, verSeguidores)
router.get("/", verificarToken, (req, res) => {
  res.redirect(`/seguidores/${req.user.idUser}`)
})

module.exports = router
