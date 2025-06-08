const express = require("express")
const router = express.Router()
const { verificarToken } = require("../middlewares/auth")
const { verSiguiendo } = require("../controllers/seguidoresController")

router.get("/:userId", verificarToken, verSiguiendo)
router.get("/", verificarToken, (req, res) => {
  res.redirect(`/siguiendo/${req.user.idUser}`)
})

module.exports = router
