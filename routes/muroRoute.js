const express = require("express")
const router = express.Router()
const { verMuro } = require("../controllers/muroController")
const { verificarTokenOpcional } = require("../middlewares/auth");
router.get("/", verificarTokenOpcional, verMuro);

module.exports = router;