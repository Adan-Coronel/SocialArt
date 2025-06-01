const app = require('./app.js');
const http = require("http");
const { inicializarSocketIO } = require("../controllers/notificacionesRealTime");
const server = http.createServer(app);

inicializarSocketIO(server);


if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
    console.log("Socket.IO inicializado para notificaciones en tiempo real");
  });
} else {
  module.exports = server;
}