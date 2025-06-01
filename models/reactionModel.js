const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const Reaction = sequelize.define(
  "Reaction",
  {
    idReaction: {
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
    tipo: {
      type: DataTypes.ENUM("like"),
      defaultValue: "like",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "reactions",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["image_id", "user_id"],
      },
    ],
  },
)

module.exports = Reaction
