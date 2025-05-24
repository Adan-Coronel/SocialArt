const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User= sequelize.define('User', {

    idUser:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey:true
    },
    nombre: {
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull: false,
        unique:true
    },
    pwd_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_at:{
        type: DataTypes.DATE,
        defaultValue:DataTypes.NOW
    },
    foto: {
        type: DataTypes.STRING
    },
    intereses: {
        type: DataTypes.TEXT
    }

}, {
    tableName: 'users',
    timestamps: false
}
);
module.exports=User;