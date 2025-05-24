const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ImageTag = sequelize.define('ImageTag', {
  image_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tag_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'image_tags',
  timestamps: false
});

module.exports = ImageTag;
