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
/*let mongo = require('mongodb');
let gestorBD = require("./services/gestorBD");
gestorBD.init(app, mongo);
app.set('db', 'mongodb://admin:admin@cluster0-shard-00-00.ki0a0.mongodb.net:27017,cluster0-shard-00-01.ki0a0.mongodb.net:27017,cluster0-shard-00-02.ki0a0.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-1tr5oe-shard-0&authSource=admin&retryWrites=true&w=majority');

//Validadores
var sanitize = require('mongo-sanitize');
const validatorUser = require('./services/validatorUser.js');
validatorUser.init(gestorBD, sanitize);

//Dependencias para mandar correos
const nodemailer = require("nodemailer");
const emailManager= require("./services/emails.js")
emailManager.init(app, nodemailer)
*/

//Rutas/controladores por lógica
//require("./routes/users")(app, gestorBD,validatorUser,emailManager);  // (app, param1, param2, etc.)