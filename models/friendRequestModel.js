const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FriendRequest = sequelize.define('FriendRequest', {
  idFriendRequest: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  from_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  to_user: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pendiente', 'aceptada', 'rechazada'),
    defaultValue: 'pendiente'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'friend_requests',
  timestamps: false
});

module.exports = FriendRequest;
