const sequelize = require('./config/db');
const User = require('./models/userModel.js');
const Comment = require('./models/commentModel.js');

async function syncTest(){

    try{
        await sequelize.authenticate();
        console.log('🟢 Conectado a socialart :)');
        await sequelize.sync({alter:true}); //sincroniza tods los modelos registrados
        //el alter actualiza la talba si le faltan columnas tambien puede borrar columnas que no coinciden con el modelo
        const comentario = await Comment.findByPk(0);
        const usuario = await User.findByPk(1);
        console.log('🟢 Comentario:', comentario ? comentario.dataValues : 'No encontrado');
        console.log('🟢 Usuario:', usuario ? usuario.dataValues : 'No encontrado');
    }catch(error){
        console.log('❌ Error:', error);
    }finally{
        await sequelize.close();
    }
}


syncTest();