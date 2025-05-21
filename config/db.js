const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('socialart', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});
module.exports = sequelize;
