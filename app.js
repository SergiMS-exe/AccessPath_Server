const express = require('express'); 
const app = express(); 
const port = process.env.PORT || 3000;

//Crear hash sobre contraseñas
let crypto = require('crypto');
app.set('clave', 'abcdefg');
app.set('crypto', crypto);

//Poder procesar la informacion del body
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`)); //Line 6

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
  // Debemos especificar todas las headers que se aceptan. Content-Type , token
  next();
});

//Configuracion de la base de datos mongo
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:admin@cluster0.xk8rxrb.mongodb.net/?retryWrites=true&w=majority";
const dbName = "AccessPath"
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const gestorBD = require('./src/services/gestorBD');
gestorBD.init(app,client, dbName);

//Validadores
/*var sanitize = require('mongo-sanitize');
const validatorUser = require('./services/validatorUser.js');
validatorUser.init(gestorBD, sanitize);

*/

//Rutas/controladores por lógica
require("./src/routes/users")(app, gestorBD);

app.get('/', function(req, res){
    res.send({msg: 'main page here. Server up'})
});