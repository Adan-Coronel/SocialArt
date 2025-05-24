const sequelize = require('./config/db');

async function probarConexion() {
  try {
    await sequelize.authenticate();
    console.log('🟢 Conectado a socialart :)');
  } catch (error) {
    console.error('🔴 >:L Error al conectar:', error);
  }
}

probarConexion();
