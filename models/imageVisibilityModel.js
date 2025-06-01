const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const ImageVisibility = sequelize.define(
  "ImageVisibility",
  {
    idImageVisibility: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    image_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    can_view: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "image_visibility",
    timestamps: false,
  },
)

module.exports = ImageVisibility
