const express = require("express")
const router = express.Router()
const { obtenerTodasLasTags } = require("../controllers/tagController")

router.get("/api/todas", obtenerTodasLasTags)

module.exports = router
