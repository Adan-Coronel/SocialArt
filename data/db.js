

var mysql = require('mysql2');

var connection = mysql.createConnection({
host: 'localhost',
user: 'root',
password: '',
database: 'datab',
port: 3306
});
connection.connect(function(error){
if(error){
throw error;
}else{
console.log('Conexion correcta.');
}
});
connection.end();