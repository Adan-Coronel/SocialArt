const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const SharedAlbum = sequelize.define(
  "SharedAlbum",
  {
    idSharedAlbum: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    viewer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    album_id: {
      type: DataTypes.INTEGER,
      allowNull: false, 
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "shared_albums",
    timestamps: false,
  },
)

module.exports = SharedAlbum
