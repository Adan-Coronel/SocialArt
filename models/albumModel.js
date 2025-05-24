const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Album = sequelize.define('Album', {
    idAlbum: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'albums',
    timestamps: false
});

module.exports = Album;