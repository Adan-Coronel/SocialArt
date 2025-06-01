const { Server } = require("socket.io")
const jwt = require("jsonwebtoken")
const { User } = require("../models/indexModel")

let io
const usuariosConectados = new Map()

const inicializarSocketIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error("No token provided"))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findByPk(decoded.idUser || decoded.id)

      if (!user) {
        return next(new Error("User not found"))
      }

      socket.userId = user.idUser
      socket.user = user
      next()
    } catch (err) {
      next(new Error("Authentication error"))
    }
  })

  io.on("connection", (socket) => {
    console.log(`Usuario ${socket.user.nombre} conectado`)

    usuariosConectados.set(socket.userId, socket.id)

    socket.on("disconnect", () => {
      console.log(`Usuario ${socket.user.nombre} desconectado`)
      usuariosConectados.delete(socket.userId)
    })
  })

  return io
}

const enviarNotificacionEnTiempoReal = (userId, notificacion) => {
  if (!io) return

  const socketId = usuariosConectados.get(userId)
  if (socketId) {
    io.to(socketId).emit("nueva_notificacion", notificacion)
  }
}

module.exports = {
  inicializarSocketIO,
  enviarNotificacionEnTiempoReal,
}
