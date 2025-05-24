const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Tag = sequelize.define('Tag', {
  idTag: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombreTag: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'tags',
  timestamps: false
});

module.exports = Tag;
