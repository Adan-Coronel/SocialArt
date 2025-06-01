const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  idNotification: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  tipo: {
    type: DataTypes.ENUM("solicitud_amistad", "comentario", "solicitud_aceptada", "reaccion"),
    allowNull: false
  },
  from_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ref_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  leido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'notifications',
  timestamps: false
});

module.exports = Notification;
