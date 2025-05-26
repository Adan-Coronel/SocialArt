const app = require('./app.js');

if(require.main===module){
    const PORT =process.env.PORT || 3000;
    app.listen (PORT, ()=>{
        console.log(`Servidor listo en http://localhost:${PORT}`);
    });
}else{
    module.exports=app;
}