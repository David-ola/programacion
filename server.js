"use strict"
//DEFINICIONES DE TODOS LOS OBJETOS
/**
 * @typedef {Object} Dimensiones
 * @property {Number} f - numero de filas
 * @property {Number} c - numero de columnas
 */

/**
 * @typedef {Object} Tablero
 * @property {Dimensiones} board - las dimensiones del tablero
 * @property {Array} info - todo el contenido que tenga el tablero
 * @property {String} nombre - el nombre de usuario del jugador
 */

/**
 * @typedef {Object} Tanque
 * @property {String} nombre - nombre del tanque
 * @preperty {Number} vida - vida del tanque
 * @preperty {Number} escudo - escudo del tanque  
 * @preperty {Number} balas - balas del tanque  
 * @preperty {Number} velocidad - velocidad del tanque  
 * @preperty {String} color - color del tanque  
 * @preperty {Number} ataque - ataque del tanque  
 * @preperty {String} ia - inteligencia artificial del tanque  
 */

/**
 * @typedef {Object} TanqueDeUser
 * @property {String} _id - mongo id
 * @property {Number} user - el id del usuario al cual corresponde dicho tanque
 * @property {Tanque} tank - el tanque en si
 */

/**
 * @typedef {Object} Player
 * @property {Number} id - id del usuario 
 * @property {String} nombre - nombre del usuario 
 * @property {String} usuario - nombre de usuario del usuario 
 * @property {String} pass - contraseña del usuario 
 * @property {String} sexo - genero del usuario 
 * @property {Date} fecha - fecha de nacimiento del usuario 
 * @property {String} correo - e-mail del usuario 
 * @property {String} encabezado - encabezado del perfil del usuario 
 * @property {String} desc - descripcion del perfil del usuario 
 * @property {String} retar - opcion de reto del perfil del usuario 
 * @property {Date} fechaAlta - fecha de alta del usuario 
 * @property {Date} fechaBaja - fecha de baja del usuario 
 */

//DEFINICIONES DE CALLBACKS

/**
 * @callback cbGuardarTanques
 * @param {MongoClient~Error} error
 * @param {null | Boolean} docs
 */

/**
 * @callback cbCheckTanques
 * @param {MongoClient~Error} error
 * @param {null | Boolean} respuesta
 */

/**
 * @callback cbTanques
 * @param {MongoClient~Error} error
 * @param {null | Tanque[]} tanques
 */

/**
 * @callback cbTodosTanques
 * @param {MongoClient~Error} error
 * @param {null | Tanque[]} tanques
 */

/**
 * @callback cbIniciarSesion
 * @param {mysql~Error} error
 * @param {String | Number} respuesta
 * @param {Array | Number} tanques
 */

/**
 * @callback cbCrearUsuario
 * @param {mysql~Error} error
 * @param {Number} num 
 */

/**
 * @callback cbActualizarPass
 * @param {mysql~Error} error
 * @param {Boolean} respuesta
 */

/**
 * @callback cbActualizarDatos
 * @param {mysql~Error} error
 * @param {Boolean} respuesta
 */

//DEFINICIONES DE OBJETOS USADOS SOLO POR LOS ENDPOINTS

/**
 * @typedef {Object} InfoLogin
 * @property {String | null} error - si hubo un error este tendrá el valor de dicho error y las demás propiedades estarán a null
 * @property {String | null} token - un token de sesión si no hubo ningun error
 * @property {Boolean} creado - si fue exitosa la creación de un nuevo usuario estará a true, si no o si hubo un error o si no se usa, estará a false
 */

/**
 * @typedef {Object} InfoHome
 * @property {String | null} error - si hubo algun error interno, se envia el tipo de error y las demás propiedades serán null
 * @property {String | null} nombre - si no hay error, será el nombre de usuario del jugador
 * @property {Array | null} tanques - si no hubo ningun error o si el jugador tiene tanques, será el array de todos los tanques del usuario
 * @property {Array | null} partidas - si no hubo ninguno error o si hay partidas en curso, será el array de todas las partidas online
 */

/**
 * @typedef InfoSelect
 * @property {String | null} error - si hubo un error, se lo manda
 * @property {Boolean} selected - estará a true si fue seleccionado exitosamente y si no, a false incluso si hubo un error
 */

/**
 * @typedef InfoNewTank
 * @property {String | null} error - lo de siempre
 * @property {Tanque | null} nuevoTanque - el objeto del nuevo tanque
 */

/**
 * @typedef {Object} InfoAction
 * @propery {String | null} error - *suspiro*
 * @property {Tablero | null} board - el contenido que tenga el tablero
 * @property {String | null} nombreTanque - el nombre del tanque con el que se juega. Null si perdio la partida
 * @property {Stats | null} stats - las estadisticas de la partida. Null si aun no terminó la partida
 */

/**
 * @typedef {Object} InfoPartida
 * @property {String | null} error - ERROR
 * @property {String | null} tokenPartida - *cof* *COF*
 * @property {Tablero | null} board - el tablero creado ya con los elementos iniciales y el tanque colocados
 */

/**
 * @typedef {Object} InfoJoin
 * @property {String | null} error - el error si hay, y si no, sera null
 * @property {String | null} tokenPartida - el token de la partida a la que se une si no hay error
 */

/**
 * @typedef {Object} Stats
 * @property {String} winner - el ganador
 * @property {Number} score - la puntuación del jugador
 */

var Tablero = require('./tablero.js');
var Elementos = require('./elementos.js');
var Player = require('./player.js');
var Partida = require('./partida.js');
var jwt = require('jsonwebtoken');
var mysql = require('mysql');
var MongoClient = require('mongodb').MongoClient;

const tick_ms = 1000;

//ARRAYS de elementos que actualmente estan en el tablero
var UsersOnline = new Map();
var PartidasOnline = new Map();

//MYSQL
/*
const mysqlconnection = {
	user: "ubuntu",
	password: "1234",
	host: "localhost",
	port: 3306
}
*/
const mysqlconnection = {
    user: "alex",
    password: "1234zxcvbnm",
    host: "mydb.cjob5ak1qqfi.eu-west-1.rds.amazonaws.com",
    port: 3306
}

//========================================================
//						FUNCTIONS
//========================================================

/**
 * Esta funcion trasforma un mapa en array
 * @param {Map} mapa - el nombre del mapa que queremos convertir en array
 * @return {Array} Array creado
*/
function mapaArray(mapa) {
    let arraypartidas = [];
    
    for (let map of mapa.entries()) {
        let partida = {}
        partida.token = map[0]
        partida.tipo = map[1]._type
        partida.jugadores = map[1]._players.size
        partida.filas = map[1]._board.Dimensiones.filas
        partida.columnas = map[1]._board.Dimensiones.columnas
        arraypartidas.push(partida);
    }

    return arraypartidas;
}
/**
 * Esta funcion crea un objeto tanque
 * @param {String} nombre - el nombre del tanque en cuestión
 * @return {Object} el objeto creado
*/
function crearTanque(nombre) {
    let obj = {
        nombre: nombre,
        vida: 10,
        escudo: 0,
        balas: 50,
        velocidad: 10,
        color: null,
        ataque: 1,
        ia: null
    }
    if (!idNuevoTanque) {
        console.log("No hay id en el tanque.")
        return;
    }
    else {
        obj.id = idNuevoTanque;
        return obj
    }
}

/**
 * Esta function chequea si un determinado usuario tiene sesion iniciada o no
 * @param {string} token - un token
 * @return {Boolean} - true si tiene o false si no
*/
function checkUser(token) {
    if (UsersOnline.size) {
        if (UsersOnline.has(token)) {
            return true;
        }
    }
    else {
        console.log("No hay users con sesion iniciada.");
        return false;
    }
}

/**
 * Esta funcion selecciona un tanque de un jugador.
 * @param {Player} user - el objeto usuario
 * @param {Number} id - el id del tanque
*/
function seleccionarTanque(user, id) {
    user.selectTanque(id);
}

/**
 * Esta función sirve para averigüar el ultimo id que hay en la base de datos de los tanques y devuelve el siguiente id para que no se repitan ids
 * @returns {null | Number} dependiendo si es valido es numero calculado o no 
 */
function idNuevoTanque() {
    todosTanques("tanques", (err, tanquecitos) => {
        if (err) {
            console.log("No se encontraron los tanques");
            return null;
        }

        if (tanquecitos) {
            let num = 0;
            for (let i = 0; i < tanquecitos.length; i++) {
                if (tanquecitos[i].info.id > num) {
                    num = tanquecitos[i].info.id;
                }
                num++;
            }
            console.log("Nuevo ID de tanque calculado")
            if (num == 0 || num <= tanquecitos[tanquecitos.length - 1].info.id) {
                console.log("Pero no fue valido...")
                return null;
            }
            else {
                console.log("Y es valido!")
                return num;
            }
        }
    })
}

//========================================================
//				          MONGODB
//========================================================

//let mongo_uri = "mongodb://localhost:27017/alex"
let mongo_uri = "mongodb://alex:1234@ds035985.mongolab.com:35985/alex"
let options = {};

/**
 * Esta funcion guarda un nuevo tanque en mongodb y lo asocia a un usuario determinado
 * @param {String} collection_name - el nombre de la coleccion
 * @param {Tanque} tanque - el objeto tanque
 * @param {Number} iduser - el id del usuario al cual le pertenece el tanque
 * @param {String} idMongo - el id de mongo
 * @param {cbGuardarTanque} f - el callback
*/
function guardarTanqueMongo(collection_name, tanque, iduser, idMongo, f) {
    MongoClient.connect(mongo_uri, options, (err, db) => {
        if (err) {
            console.log("Can not connect to mongo " + err);
            return f(err, null);
        }


        let collection = db.collection(collection_name);
        let docs = {
            user: iduser,
            tank: tanque
        }

        if (idMongo) {
            docs._id = idMongo;
        }

        collection.save(docs, (err, result) => {
            db.close();
            return f(err, true)
        })
    })
}

/**
 * Esta funcion sirve para verificar si el usuario indicado tiene por lo menos un tanque
 * @param {String} collection_name - el nombre de la coleccion
 * @param {Number} idUser - el id del usuario
 * @param {cbCheckTanques} f - el callback
 */
function checkTanqueMongo(collection_name, idUser, f) {
    MongoClient.connect(mongo_uri, options, (err, db) => {
        if (err) {
            console.log("Can not connect to mongo " + err);
            return f(err, null);
        }

        let collection = db.collection(collection_name);

        collection.findOne({ user: idUser }).toArray((err, docs) => {
            db.close();
            if (docs.length) {
                return f(err, true);
            }
            else {
                return f(err, false);
            }
        })
    })
}

/**
 * Esta function verifica y devuelve los tanques de un usuario en particual
 * @param {String} collection_name - nombre de la coleccion
 * @param {Number} id - el id del usuario 
 * @param {cbTanques} f - callback
*/
function tanques(collection_name, id, f) {
    console.log("buscando tanques en la col. " + collection_name)
    MongoClient.connect(mongo_uri, options, (err, db) => {
        if (err) {
            console.log("Can not connect to mongo " + err);
            return f(err, null);
        }

        let collection = db.collection(collection_name);

        collection.find({ user: id }).toArray((err, docs) => {
            console.log("Encontrados los tanques del user id:" + id)
            db.close();
            return f(err, docs);
        })
    })
}

/**
 * Esta function devuelve todos los tanques de la base de datos
 * @param {String} collection_name - nombre de la coleccion
 * @param {cbTodosTanques} f - callback
*/
function todosTanques(collection_name, f) {
    console.log("buscando tanques en la col. " + collection_name)
    MongoClient.connect(mongo_uri, options, (err, db) => {
        if (err) {
            console.log("Can not connect to mongo " + err);
            return f(err, null);
        }

        let collection = db.collection(collection_name);

        collection.find().toArray((err, docs) => {
            console.log("Encontrados los tanques.")
            db.close();
            return f(err, docs);
        })
    })
}

//========================================================
//				          MYSQL
//========================================================


/**
* Esta function chequea si un usuario determinado esta en la base de datos. Dependiendo de si existe o no el user, devuelve diferentes cosas
* @param {String} user - el nombre de usuario recibido
* @param {String} pass - la password correspondiente al nombre de usuario
* @param {cbIniciarSesion} f - el callback
*/
function iniciarSesion(user, pass, f){
	const sql = "SELECT * FROM users.users WHERE usuario = '"+user+"' && pass = '"+pass+"'";
	let cliente = mysql.createConnection(mysqlconnection);
	cliente.connect(err =>{
		if(err){
			console.log(err);
			return f(err, null);
		}
		
		cliente.query(sql, (err, rows, fields)=>{
			if(err){
				console.log(err);
				return f(err, null);
			}
			
			if(rows.length){
				cliente.end();
				console.log("encontrado el user");
				
				let jugador = new Player(rows[0].id, rows[0].usuario, rows[0].nombre);
				jugador.gender = rows[0].sexo;
				jugador.date = rows[0].fecha;
				jugador.mail = rows[0].correo;
				let token = jwt.sign(jugador.profile, pass, {expiresIn: 3600});
				
				jugador.token = token;
				UsersOnline.set(token, jugador);	
				
				tanques("tanques", jugador.info.id, (err, array)=>{
					if(err){
						console.log(err);
					}
					else if(array.length){
                        console.log("He encontrado "+array.length+" tanques")
						for(let i = 0; i < array.length; i++){
							let tanque = new Elementos.Tanque(array[i]);
                            console.log("tanque "+(i+1)+": "+tanque.info.name)
							jugador.addTanque(array[i].tank.id, tanque);     
						}
						
						return f(err, jugador.token);
					}
					else{
						return f(err, jugador.token)
					}
				})					
			}
			
			else{
				cliente.end();
				console.log("No existe el user");
				return f(err, 0, 0);
			}
		})
	})
}
/**
 * Esta function sirve para crear un usuario nuevo en la base de datos si no existe ya.
 * @param {String} user - el nombre de usuario
 * @param {String} nombre - el nombre real de usuario
 * @param {String} pass - la contraseña del usuario
 * @param {cbCrearUsuario} f - callback
*/
function crearUsuario(user, nombre, pass, f) {
    const sql = 'SELECT * FROM users.users where usuario = "' + user + '"';
    const sql2 = 'INSERT INTO users.users (id, nombre, usuario, pass) VALUES(NULL, "' + nombre + '", "' + user + '", "' + pass + '")';
    let cliente = mysql.createConnection(mysqlconnection);
    cliente.connect(err => {
        if (err) {
            console.log("\nProblema interno. Error.\n");
            return f(err, 2);
        }
        cliente.query(sql, (err, rows, fields) => {
            if (err) {
                console.log("\nProblema interno. Error.\n");
                return f(err, 2);
            }

            if (rows.length) {
                cliente.end();
                console.log("\nUsuario ya existe\n");
                return f(err, 1);
            }
            else {
                cliente.query(sql2, (err, result, fields) => {
                    cliente.end();
                    if (err) {
                        console.log("\nNo se creo al usuario. Error.\n");
                        return f(err, 2);
                    }

                    if (result.affectedRows > 0) {
                        console.log("\nUsuario creado\n");
                        return f(err, 0);
                    }
                })
            }
        })
    })
}

/**
 * Esta funcion actualiza la contraseña de un usuario
 * @param {Number} id - id del usuario
 * @param {String} pass - la nueva contraseña
 * @param {cbActualizarPass} f - el callback
 */
function actualizarPass(id, pass, f) {
    const sql = "UPDATE users.users SET pass = '" + pass + "' WHERE id = " + id;
    let cliente = mysql.createConnection(mysqlconnection);
    cliente.connect(err => {
        if (err) {
            console.log("\nProblema interno. Error.\n")
            return f(err, false);
        }

        cliente.query(sql, (err, result, fields) => {
            if (err) {
                console.log("\nProblema interno. Error.\n")
                return f(err, false);
            }

            if (result.affectedRows > 0) {
                console.log("Password del user con id " + id + " actualizada");
                let b = true;
                return f(err, b);
            }

            else {
                console.log("No se actualizó la pass. Error\n");
                return f(err, false);
            }
        })
    })
}

/**Esta funcion actualiza los datos basicos del usuario
 * @param {Number} jugador - el id del usuario
 * @param {String} nombre - el nuevo nombre real del usuario
 * @param {Date} fecha - la nueva fecha de nacimiento
 * @param {String} correo - la nueva dirección de correo electrónico
 * @param {String} sexo - el nuevo género del usuario
 * @param {cbActualizarDatos} f - el callback
 */
function actualizarDatos(jugador, nombre, fecha, correo, sexo, f) {
    const sql = "UPDATE users.users SET nombre = '" + nombre + "', sexo = '" + sexo + "', fecha = '" + fecha + "', correo = '" + correo + "' WHERE id = " + jugador.info.id;
    let cliente = mysql.createConnection(mysqlconnection);
    cliente.connect(err => {
        if (err) {
            console.log("\nProblema interno. Error.\n")
            return f(err, false);
        }

        cliente.query(sql, (err, result, fields) => {
            if (err) {
                console.log("\nProblema interno. Error.\n")
                return f(err, false);
            }

            if (result.affectedRows > 0) {
                console.log("Info del user con id " + jugador.info.id + " actualizada");
                jugador.name = nombre;
                jugador.gender = sexo;
                jugador.date = fecha;
                jugador.mail = correo;
                return f(err, true);
            }

            else {
                console.log("No se actualizó la info. Error\n");
                return f(err, false);
            }
        })
    })
}



//========================================================
//						ENDPOINTS
//========================================================

var express = require("express");
var BodyParser = require("body-parser");
var server = express();
server.use(BodyParser.json()); //jquery y envia en json
server.use(BodyParser.urlencoded({ extended: true })); //para formularios en post

server.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token, Accept-Encoding")
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    next();
})

/**
 * Este endpoint recibe:
 * {String} oculto -  "login" o "insert" para iniciar sesion o crear una nueva cuenta
 * Además necesita recibir para login:
 * {String} user - nombre de usuario
 * {String} pass - la contraseña correspondiente
 * Y para insert necesita:
 * {String} user - nombre de usuario
 * {String} pass - la contraseña correspondiente
 * {String} nombre - el nombre real del usuario
 * Devuelve un objeto de tipo {InfoLogin}
 */
server.post("/", (req, res)=>{  
    let infoLogin = {
        error: null,
        token: null,
        creado: false
    }

    if (req.body.oculto == "login") {
        console.log("\niniciando sesion...");

        if (!req.body.user || !req.body.pass) {
            infoLogin.error = "RELLENE TODAS LAS CASILLAS"
            res.json(infoLogin);
            console.log("Faltan casillas por rellenar.\n");
            res.end();
            return;
        }

        iniciarSesion(req.body.user, req.body.pass, (err, token) => {
            console.log("Confirmando usuario...")
            if (err) {
                infoLogin.error = "Error interno"
                res.json(infoLogin);
                console.log("error\n");
                res.end();
                return;
            }

            else {
                infoLogin.token = token
                res.json(infoLogin);
                console.log("sesion iniciada. token enviado\n");
                res.end();
                return;
            }
        })
    }

    else if (req.body.oculto == "insert") {
        console.log("insertando...");

        crearUsuario(req.body.user, req.body.nombre, req.body.pass, (err, num) => {
            if (err) {
                infoLogin.error = "Error interno"
                res.json(infoLogin);
                console.log("error\n");
                res.end();
                return;
            }

            if (num == 1) {
                infoLogin.error = "El nombe de usuario ya está en uso"
                res.json(infoLogin);
                console.log("repetido nombre de user\n");
                res.end();
                return;
            }

            else if (num == 0) {
                infoLogin.creado = true;
                res.json(infoLogin);
                console.log("enviado true\n")
                res.end();
                return;
            }

            if (num == 2) {
                infoLogin.error = "Error interno"
                res.json(infoLogin);
                console.log("error\n");
                res.end();
                return;
            }
        })
    }

    else {
        infoLogin.error = "ERROR! Falta algo importante..."
        console.log("LO SABIA! oculto no tiene el valor que debería tener!\n")
        res.json(infoLogin);
        res.end();
        return;
    }
})

/**
 * Este endpoint recibe:
 * {String} token - un token de un usuario que haya iniciado sesión
 * Devuelve un objeto de tipo {InfoHome}
 */

server.post('/home', (req, res)=>{
	console.log("\nPeticion a home");
    let infoHome = {
        error: null,
        nombre: null,
        tanques: null,
        partidas: null
    }

    if (!req.body.token) {
        infoHome.error = "No se ha iniciado una sesión";
        console.log("No se ha recibido un token\n");
        res.json(infoHome);
        res.end();
        return;
    }

    if (checkUser(req.body.token)) {
        let user1 = UsersOnline.get(req.body.token);

        tanques("tanques", user1.profile.id, (err, arrayTanques) => {
            if (err) {
                console.log("error interno\n");
                infoHome.error = "error interno";
                res.json(infoHome);
                res.end();
                return;
            }

            if (arrayTanques.length && PartidasOnline.size) {
                infoHome.nombre = user1.info.user;
                infoHome.tanques = arrayTanques;
                infoHome.partidas = mapaArray(PartidasOnline);
                console.log(JSON.stringify(infoHome.partidas))
                res.json(infoHome);
                res.end();
                console.log("Info enviada\n");
                return;
            }
            else if (!PartidasOnline.size) {
                infoHome.nombre = user1.info.user;
                infoHome.tanques = arrayTanques;
                res.json(infoHome);
                res.end();
                console.log("Info enviada, pero no hay partidas\n");
                return;
            }
            else {
                infoHome.nombre = user1.info.user;
                res.json(infoHome);
                console.log("enviada info, pero no tanques porque no tiene ni partidas\n");
                res.end();
                return;
            }
        })
    }

    else {
        infoHome.error = "Este usuario no tiene iniciada la sesión";
        console.log("token incorrecto\n");
        res.json(infoHome);
        res.end();
        return;
    }
})

/**Este endpoint sirve para seleccionar un tanque para que (en otro endpoint) se añada a una partida directamente
 * Recibe: 
 * {String} token - el token en uso
 * {Number} id - el id del tanque a seleccionar
 * Devuelve un objeto de tipo {InfoSelect}
*/
server.post('/select', (req, res) => {
    console.log("\nseleccionando tanque");

    let infoSelect = {
        error: null,
        selected: false
    }

    if (checkUser(req.body.token)) {
        let user = UsersOnline.get(req.body.token);
        let idNuevo = parseInt(req.body.id);
        seleccionarTanque(user, idNuevo);
        infoSelect.selected = true;
        res.json(infoSelect);
        console.log("Tanque seleccionado\n")
        return;
    }

    else {
        infoSelect.error = "Este usuario no tiene iniciada la sesión";
        res.json(infoSelect);
        console.log("Token incorrecto\n");
        res.end();
        return;
    }
})

/**
 * Este endpoint existe para crear nuevos tanques a diferentes usuarios
 * Recibe: 
 * {String} token - a estas alturas no hace falta decir que hostia es esto
 * {String} nombreTanque - el nombre del tanque a crear
 * Devuelve un objeto de tipo {InfoNewTank}
 */
server.post('/newtank', (req, res) => {
    let infoNewTank = {
        error: null,
        nuevoTanque: null
    }

    if (!req.body.token || !UsersOnline.has(req.body.token)) {
        infoNewTank.error = "Sesión caducada"
        res.json(infoNewTank);
        console.log("Token incorrecto\n");
        res.end();
        return;
    }

    let user = UsersOnline.get(req.body.token).info.id;
    let tanquecito = crearTanque(req.body.nombreTanque, user);

    if (!tanquecito.id) {
        console.log("Error. tanque sin id");
        infoNewTank.error = "No se creó el tanque correctamente."
        res.json(infoNewTank);
        res.end();
        return;
    }

    guardarTanqueMongo("tanques", tanquecito, user, null, (err, respuesta) => {
        if (err) {
            console.log("\nError al responder a la peticion");
            infoNewTank.error = "Error al responder a la peticion"
            res.json(infoNewTank);
            res.end();
            return;
        }

        if (!respuesta) {
            infoNewTank.error = "No se creo el tanque por algun error interno"
            res.json(infoNewTank);
            console.log("Error\n")
            res.end();
            return;
        }

        else {
            console.log("Contestando peticion. Enviando tanque recien creado\n");
            infoNewTank.nuevoTanque = tanquecito
            res.json(infoNewTank);
            res.end();
            return;
        }
    });
})

/** 
 * Este endpoint controla todas las acciones que se hagan en el tablero de una partida
 * Recibe:
 * {String} token - oh dios santo
 * {String} tokenPartida = AHA! Este es el token especifico de la partida
 * {String} boton - la accion. Tiene que ser "move", "turnR", "turnL" o "shoot", en caso contrario, error!
 * {Number} tanque - el id del tanque
 * Devuelve un objeto de tipo {InfoAction}
*/
server.post('/action', (req, res) => {
    let idTanque = parseInt(req.body.tanque)
    let infoAction = {
        error: null,
        board: null,
        nombreTanque: null,
        stats: null
    }

    if (!req.body.token || !req.body.tokenPartida) {
        infoAction.error = "Sesion caducada"
        res.json(infoAction);
        console.log("Token incorrecto");
        res.end();
        return;
    }

    let partida = PartidasOnline.get(req.body.tokenPartida);
    let user1 = UsersOnline.get(req.body.token);
    if(partida){
        if(partida.tanksLeft == 1){
            infoAction.stats = partida.stats;
            console.log("Partida terminada. Ganador: "+infoAction.winner+"\n");
            res.json(infoAction);
            res.end();
            return;
        }
        
        let respuesta = partida.checkear(idTanque, req.body.token);
        
        if(respuesta.status){
            infoAction.nombreTanque = user1.getTanque(idTanque).info.name;
        }
        else if(respuesta.error == 2){
            console.log(user1.info.user+" ha perdido. Está espectando\n");
            partida.moverBalas();
            infoAction.board = partida.board(user1);
            infoAction.nombreTanque = null;
            res.json(infoAction);
            res.end();
            return;
            
        }
        else{
            console.log("Este jugador: "+user1.info.user+" no está en esta partida.\n")
            infoAction.error = "Error: no te has unido a la partida";
            res.json(infoAction);
            res.end();
            return;
        }

        if (req.body.boton) {
            console.log("\nPeticion action")
            for (let i = 0; i < partida.tanks.length; i++) {
                if (idTanque == partida.tanks[i].info.id) {
                    console.log("dentro")

                    if (req.body.boton == "move") {
                        console.log("moviendo...\n")
                        if (partida.tab.Mover(partida.tanks[i].info.pos.f, partida.tanks[i].info.pos.c, partida.tanks[i].info.o) != true) {
                            infoAction.error = "Problema al moverse"
                            infoAction.board = partida.board(user1);
                            console.log("Error: no se puede mover")
                            res.json(infoAction);
                            res.end();
                            return;
                        }
                        else {
                            infoAction.board = partida.board(user1);
                            res.json(infoAction);
                            console.log(JSON.stringify(partida.board(user1))+"\n");
                            res.end();
                            return;
                        }
                    }

                    if (req.body.boton == "turnR") {
                        console.log("girando hacia a la derecha...");
                        if (!partida.tab.Girar(partida.tanks[i].info.pos.f, partida.tanks[i].info.pos.c, "d")) {
                            infoAction.error = "Problema al girar a la derecha"
                            infoAction.board = partida.board(user1);
                            console.log("Error: no se puede girar a la der")
                            res.json(infoAction);
                            res.end();
                            return;
                        }
                        else {
                            infoAction.board = partida.board(user1)
                            res.json(infoAction);
                            console.log(JSON.stringify(partida.board(user1))+"\n");
                            res.end();
                            return;
                        }
                    }

                    if (req.body.boton == "turnL") {
                        console.log("girando hacia a la izquierda...");
                        if (!partida.tab.Girar(partida.tanks[i].info.pos.f, partida.tanks[i].info.pos.c, "i")) {
                            infoAction.error = "Problema al girar a la izquierda"
                            infoAction.board = partida.board(user1);
                            console.log("Error: no se puede girar a la izq")
                            res.json(infoAction);
                            res.end();
                            return;
                        }
                        else {
                            infoAction.board = partida.board(user1)
                            res.json(infoAction);
                            console.log(JSON.stringify(partida.board(user1))+"\n");
                            res.end();
                            return;
                        }
                    }

                    if (req.body.boton == "shoot") {
                        console.log("disparando...")
                        partida.crearBala(partida.tanks[i].info.pos.f, partida.tanks[i].info.pos.c, partida.tanks[i].info.o);
                        console.log(JSON.stringify(partida.board(user1))+"\n");
                        infoAction.board = partida.board(user1)
                        res.json(infoAction);
                        res.end();
                        return;
                    }

                    else {
                        infoAction.error = "Comando Incorrecto"
                        res.json(infoAction);
                        console.log("comando not found\n");
                        res.end();
                        return;
                    }
                }
            }
        }
        
        else{ 
            partida.moverBalas();
            infoAction.board = partida.board(user1)
            res.json(infoAction);
            res.end();
            return;
        }
    }    
	else{
        console.log("Me hacen peticiones a lo loco sin info\n")
        infoAction.error = "Que te den. Manda la info necesaria si quieres algo de mi!"
        res.json(infoAction);
        res.end();
        return;
    }
})

server.post('/edit', (req, res)=>{
    console.log("\Peticion a edit")
	if(!req.body.token || !UsersOnline.has(req.body.token)){
		res.send(JSON.stringify({"mensaje":"Sesión caducada"}));
		console.log("Token incorrecto\n");
		res.end();
		return;
	}	
	
	if(req.body.first){
		let user = UsersOnline.get(req.body.token);
		res.send(user.info);
		console.log("Primera peticion. Enviado datos de perfil\n");
		res.end();
		return;
	}
	
	if(req.body.pass){
        console.log("Cambiar password...")
		let user = UsersOnline.get(req.body.token);
		actualizarPass(user.info.id, req.body.pass, (boolean)=>{
			if(boolean){
				res.send({"done":true});
				console.log("enviada respuesta. true\n");
				res.end();
				return;
			}
			else{
				res.send({"done":false});
				console.log("enviada respuesta. false\n");
				res.end();
				return;
			}
		})
	}
	
	if(req.body.infoGeneral){
        console.log("Cambiar datos generales...")
		let user = UsersOnline.get(req.body.token);	
		actualizarDatos(user, req.body.name, req.body.date, req.body.mail, req.body.gender, (boolean)=>{
			if(boolean){
				res.send({"done":true});
				console.log("enviada respuesta. true\n");
				res.end();
				return;
			}
			else{
				res.send({"done":false});
				console.log("enviada respuesta. false\n");
				res.end();
				return;
			}
		})
	}
    
    //seguir con cambios en el perfil. Mongo o MySQL para descripcion de perfil?! 
    if(req.body.infoPerfil){
        console.log("Cambiar info de perfil...")
        let user = UsersOnline.get(req.body.token);	
    }
})

/**Este endpoit se encarga de crear una partida 
 * Recibe: 
 * {String} token - ....
 * {Number} f - numero de filas del tablero
 * {Number} c - numero de columnas del tablero
 * {Number} idTanque - el id del tanque seleccionado del jugador que crea la partida
 * {String} tipo - el tipo de partida. tiene que ser "N", "M", "F" o "T"
 * Devuelve un objeto de tipo {InfoPartida}
 */
server.post('/partida', (req, res) => {
    console.log("Peticion crear nueva partida")

    let infoPartida = {
        error: null,
        tokenPartida: null,
        board: null
    }

    if (!req.body.token || !UsersOnline.has(req.body.token)) {
        infoPartida.error = "Sesión caducada"
        res.json(infoPartida);
        console.log("Token incorrecto\n");
        res.end();
        return;
    }
    
    let user = UsersOnline.get(req.body.token);

    if (req.body.f && req.body.c && req.body.idTanque) {
        let info = {
            tipo: req.body.tipo,
            jugadores: null,
            tanques: null,
            rocas: null,
            tablero: {
                f: parseInt(req.body.f),
                c: parseInt(req.body.c)
            }
        }
        let partida = new Partida(info);
        let tanque = user.getTanque(parseInt(req.body.idTanque));
        //crear rocas
        partida.crearRocas(partida.dimensiones.filas, partida.dimensiones.filas, partida.dimensiones.columnas);
        //posicionar y tanque
        let respuesta = partida.posicionarTanque(tanque)
        if (!respuesta.status) {
            console.log("NO SE AÑADIO EL TANQUE EN EL TABLERO");
            infoPartida.error = "No se añadio el tanque en el tablero por motivos de otra galaxia."
            res.json(infoPartida);
            res.end();
            return;
        }
        else{
            partida.addTanque(tanque);
            //añadir jugador a juego en ese tablero
            partida.addJugador(req.body.token, user);
            
            //se añade la partida al array de partidas en linea
            let tokenPartida = jwt.sign((user.info.user + "partida" + (PartidasOnline.size + 1)), "12341234");
            PartidasOnline.set(tokenPartida, partida);
            console.log(JSON.stringify(partida))
            console.log("Partida creada.");
            infoPartida.tokenPartida = tokenPartida;
            infoPartida.board = partida.board(user);
            res.json(infoPartida);
            console.log("Info envida\n");
            res.end();
            return;
        }
    }
})

/**
 * Este endpoint se usa cuando un jugador se quiere unir a una partida
 * Recide: 
 * {String} token - el token del jugador que quiere unirse
 * {String} tokenPartida - el token de la partida a la cual se quiere unir
 * {Number} idTanque - el id del tanque con el que va a jugar
 * Devuelve un objeto de tipo {InfoJoin}
 */
server.post('/join', (req, res) => {
    console.log("Petición de unirse a partida");
    let infoJoin = {
        error: null,
        tokenPartida: null
    }

    if (!req.body.token || !UsersOnline.has(req.body.token)) {
        infoJoin.error = "Sesión caducada"
        res.json(infoJoin);
        console.log("Token incorrecto\n");
        res.end();
        return;
    }

    if (!req.body.tokenPartida || !PartidasOnline.has(req.body.tokenPartida)) {
        console.log("Esta partida no existe\n");
        infoJoin.error = "Partida desconocida"
        res.json(infoJoin);
        res.end();
        return;
    }

    if (req.body.idTanque) {
        console.log("Colocando tanque en partida...");
        let user = UsersOnline.get(req.body.token);
        let tanque = user.getTanque(parseInt(req.body.idTanque));
        let partida = PartidasOnline.get(req.body.tokenPartida);
        let resultado = !partida.posicionarTanque(tanque)
        if (!resultado.status && resultado.error == 1) {
            console.log("NO SE AÑADIO EL TANQUE EN EL TABLERO. tablero lleno\n");
            infoJoin.error = "No se te puedes añadir a esta partida porque el tablero está lleno."
            res.json(infoJoin);
            res.end();
            return;
        }
        if (!resultado.status && resultado.error == 2) {
            console.log("Este tanque ya está en juego.\n");
            infoJoin.tokenPartida = req.body.tokenPartida;
            res.json(infoJoin);
            res.end();
            return;
        }
        partida.addTanque(tanque);
        //añadir jugador a juego en ese tablero
        partida.addJugador(req.body.token, user);
        console.log("Unido a partida");
        infoJoin.tokenPartida = req.body.tokenPartida;
        res.json(infoJoin);
        console.log("Info enviada\n");
        res.end();
        return;
    }

    else {
        console.log("No existe ese tanque");
        infoJoin.error = "No hay tanque que meter en partida";
        res.json(infoJoin);
        res.end();
        return;
    }
});


server.listen(3000);