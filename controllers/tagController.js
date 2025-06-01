const { Tag, Album } = require("../models/indexModel")


const obtenerTodasLasTags = async (req, res) => {
  try {
    const tags = await Tag.findAll({
      order: [["nombreTag", "ASC"]],
    })
    res.json({ success: true, tags })
  } catch (err) {
    console.error("Error al obtener tags:", err)
    res.status(500).json({ error: "Error interno al obtener tags" })
  }
}

module.exports = {
  obtenerTodasLasTags,
}
