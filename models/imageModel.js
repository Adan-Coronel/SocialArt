const {DataTypes} = require ('sequelize');
const sequelize= require('../config/db');

const Image = sequelize.define('Image',{
    idImage: {
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    album_id:{
        type: DataTypes.INTEGER,
        allowNull:false     
    },
    url:{
        type:DataTypes.STRING,
        allowNull:false
    },
    caption:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    created_at:{
        type:DataTypes.DATE,
        defaultValue:DataTypes.NOW
    }  

},{
    tableName:'imagenes',
    timestamps:false
});
module.exports=Image;