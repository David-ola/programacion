"use strict"


/**
 * @typedef {Object} Resultado
 * @property {Boolean} status - true si no hubo error, false si hubo
 * @property {Number} error - el tipo de error que fue. 
 */

var Elementos = require('./elementos.js');
var Player = require('./player.js');
var Tablero = require('./tablero.js');

class Partida{    
    constructor(info){
        this._id = info.id; //mongoid
        this._type = info.tipo || "N"; //tipo es el tipo de partida y tiene que ser T (tiempo), M (movimientos), F (fatality) o N (normal)
        this._players = info.jugadores || new Map(); //map de juagdores
        this._tanks = info.tanques || []; //array de tanques
        this._rocks = info.rocas || []; //array de rocas
        this._bullets = []; //array de balas
        this._board = new Tablero(info.tablero.f, info.tablero.c); //objeto {Tablero}
        this._stats = {
            winner: null,
            score: 0
        }
    }
    
    set id(mongoid){
        this._id = mongoid;
    }
    
    set winner(name){
        this._stats.winner = name;
    }
    
    set score(num){
        this._stats.score += num;
    }
    
    get stats(){
        return this._stats;
    }
    
    get dimensiones(){
        return this._board.Dimensiones;
    }
    
    get id(){
        return this._id;
    }
    
    get tab(){
        return this._board;
    }
    
    get tanks(){
        return this._tanks;
    }
    
    get tanksLeft(){
        console.log("dentro tanks left")
        if(this._tanks.length == 1){
            this.winner(this.tanks[0].info.name);
        }
        console.log(this._tanks.length+"\n\n\n")
        return this._tanks.length
    }
    
    get info(){
        return {
            type: this._type,
            players: this._players,
            tanks: this._tanks,
            rocks: this._rocks,
            board: this._board
        }
    }
    
    //añadir un jugador en juego
    addJugador(id, player){
        this._players.set(id, player)
    }
    
    //añadir un tanque en juego
    addTanque(tank){
        this._tanks.push(tank);
    }
    
    //empezar la partida
    //tick_ms = 1000
    start(tick_ms){
        setInterval(this.ticks, tick_ms);  
    }
    
    /**
    * Esta suma +1 al tiempo de ejecucion del juego segun los ticks que tenga la partida.
    * Tambien mueve automaticamente las balas en juego sin que los jugadores tengan que ejecutar cualquier acción.
    */
    ticks(){
        //tiempo del tablero
        this.moverBalas();
    }
    
    /**
    * Esta function sirve para verificar si una posicion del tablero esta vacia.
    * @param {Number} filas - la fila
    * @param {Number} columnas - la columna
    * @return {Array} un array de length 2 si la casilla esta vacia, siendo [0] el numero de la fila y [1] el numero de la columna
    */
    casillaLibre(filas, columnas){
        let bool = false;
        let array = [];
        let bla = this.numOcupadas();

        if(bla == (filas * columnas)){
            console.log("Tablero lleno");
            return null;
        }
        
        else{		
            while(bool == false){
                array[0] = Math.floor(Math.random() * filas);
                array[1] = Math.floor(Math.random() * columnas);
            
                if(!this._board.getCasilla(array[0], array[1])){
                    bool = true;
                }
            }
        }
        return array;
    }
    
    /**
    * Esta function solo sirve para saber el numero de casillas ocupadas en el tablero
    * @return {Number} el numero de casillas ocupadas
    */
    numOcupadas(){
        return this._board.Contenido.length;
    }
    
    /**
    * Esta function crea un numero aleatorio entre 0 y 3 cada correspondiendo con una coordenada geografica para 
    * orientar los elementos creados por primera vez de una manera totalmente aleatoria.
    * @return {String} la orientacion correspondiete (n, s, e, o);
    */
    randomOrientacion(){
        let num = Math.floor(Math.random() * 4);
        
        switch (num){
            case 0:
                return "n";
            
            case 1:
                return "e";
            
            case 2:
                return "s";
                
            case 3:
                return "o";
        }
    }
    
    /**
     * Esta function crea rocas y las coloca en el tablero tantas veces como se le indique
     * @param {Number} num - el numero de rocas que se quiere crear
     * @param {Number} f - el numero de filas del tablero
     * @param {Number} c - el numero de columnas del tablero
    */
    crearRocas(num, f, c){
        for(let i = 0; i < num; i++){
            let array = this.casillaLibre(f, c);	
            let roca = new Elementos.Roca(array[0], array[1]);	
            console.log("roca creada")
            this._rocks.push(roca);
            this._board.setCasilla(roca.info.pos.f, roca.info.pos.c, roca);
            console.log(this._board.Contenido);
        }
    }
    
    /**
     * Para facilitar y reducir el numero de lineas en el servidor en un endpoint, se creó esta función que chequea si existe 
     * un determinado jugador en esta partida y si su tanques está activo o no
     * @param {Number} idTanque - el id del tanque
     * @param {String} tokenUser - el token del user
     * @returns {Resultado} - 1 = no user ni tanque, 2 = hay user pero tanque está muerto
     */
    checkear(idTanque, tokenUser){
        let res = {
            status: null,
            error: null
        }
        
        if(!this.existeTanque(idTanque) && ! this.existePlayer(tokenUser)){
            res.status = false;
            res.error = 1;
            return res;
        }
        else if(!this.existeTanque(idTanque) && this.existePlayer(tokenUser)){
            res.status = false;
            res.error = 2;
            return res;
        }
        else{
            res.status = true;
            return res; 
        }
    }

    /**
    * Esta function analiza si un determinado tanque ya está en juego para que no se creen tanques con el mismo ID
    * @param {String|Number} nombre el ID del tanque a analizar
    * @return {Boolean} true si existe el tanque mencionado o false si no existe.
    */
    existeTanque(nombre){	
        if(this._tanks.length){
            for(let i = 0; i < this._tanks.length; i++){
                if(this._tanks[i].info.id == nombre){
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Esta funcion chequea si un determinado jugador pertenece a esta partida o no
     * @param {String} token - el token perteneciente al jugador
     * @returns {Boolean} true si está, false si no
     */
    existePlayer(token){
        if(this._players.get(token)){
            return true
        }
        else{
            return false
        }
    }
    
    /**
     * Esta function posiciona un determinado tanque en el tablero
     * @param {Tanque} tanque - el objeto tanque
     * @return {Resultado} - 1 = tablero lleno, 2 = tanque ya colocado
    */
    posicionarTanque(tanque){
        let res = {
            status: null,
            error: null
        }
        console.log("entrando en tanque "+tanque.info.name);
        let pos = this.casillaLibre(this._board.Dimensiones.filas, this._board.Dimensiones.columnas);
        console.log("tengo la casilla libre "+pos)
        if(!pos){
            console.log("Se intenta crear un tanque, pero el tablero esta lleno\n");
            res.status = false;
            res.error = 1;
            return res;
        }
        
        if(this.existeTanque(tanque.info.name)){
            console.log("El tanque indicado ya esta en juego\n")
            res.status = false;
            res.error = 2;
            return res;
        }
        else{	
            console.log("colocando tanque en la casilla");
                    
            tanque.Fila = pos[0];
            tanque.Columna = pos[1];
            tanque.Orientacion = this.randomOrientacion();
            console.log("llamando a setCasila")			
            if(!this._board.setCasilla(tanque.info.pos.f, tanque.info.pos.c, tanque)){
                console.log("Tablero lleno\n");
                res.status = false;
                res.error = 1;
                return res;
            }
            
            else{
                this.addTanque(tanque);
                console.log("nuevo tanque colocado\n");
                res.status = true;
                return res;
            }
        }
    }
    
    /**
    * Esta function crea una bala una posicion a continuacion al tanque que dispara segun la orientacion de este.
    * Se puede o no crear la bala si la casilla esta vacia o no, y si no esta vacia, informa que tipo de objeto está
    * ocupando la casilla (tanque o roca o fuera del tablero si se da el caso)
    * @param {Number} f - la fila donde se encuentra el tanque
    * @param {Number} c - la columna donde se encuentra el tanque
    * @param {String} o - la orientacion que tiene el tanque
    * @return {Boolean} true si fue creada la bala o false si la casilla calculada está ocupada o si no existe
    */
    crearBala(f, c, o){
        let f2 = f, c2 = c;
        
        switch(o){
            case 'n':
                f2--;
                break;
                
            case 's':
                f2++;
                break;
                
            case 'e':
                c2++;
                break;
                
            case 'o':
                c2--;
                break;
        }
        
        if((f2 < 0 || c2 < 0) || (f2 > this._board.Dimensiones.filas-1 || c2 > this._board.Dimensiones.columnas-1 )){
            console.log("Bala disparada fuera del tablero.\n");
            return false;
        }
        
        else{
            let bala = new Elementos.Bala(f2, c2, o);
            console.log("bala disparada");
            if(this._board.getCasilla(f2, c2)){
                if(this._board.getCasilla(f2, c2).info.type == "Tanque"){
                    this._board.getCasilla(f2, c2).Vida = 1;
                    console.log("Tanque "+this._board.getCasilla(f2, c2).info.name+" acaba de ser disparado. -1 Vida\n");
                    return false;
                }
                else{
                    console.log("se disparo a una roca\n");
                    return false;
                }
            }
            else{
                this._board.setCasilla(bala.info.pos.f, bala.info.pos.c, bala);
                this._bullets.push(bala);
                return true;	
            }
        }
    }

    /**
     * Esta funcion se encarga de destruir todas las bala que choquen contra un elemento del tablero si su posicion coincide 
     * con dicho elemento
     * @param {Number} fila - la fila del elemento
     * @param {Number} columna - la columna del elemento
     */
    destruirBala(fila, columna){
        for(let i = 0; i < this._bullets.length; i++){
            if(this._bullets[i].info.pos.f == fila && this._bullets[i].info.pos.c == columna){
                this._bullets.splice(i, 1);
                return true;
            }
        }
    }

    /**
    * Esta function mueve todas las balas en el tablero segun sus trayectorias (verticales u horizontales).
    * Si la bala llega fuera del tablero o si choca contra un objeto, informa de que caso se trata.
    */
    moverBalas(){
        if(this._bullets.length){
            console.log("moviendo bala...");
            for(let i = 0; i < this._bullets.length; i++){
                let move = this._board.Mover(this._bullets[i].info.pos.f, this._bullets[i].info.pos.c, this._bullets[i].info.o);
                
                if(!move){
                    this._board.vaciaCasilla(this._bullets[i].info.pos.f, this._bullets[i].info.pos.c);
                    this._bullets.splice(i, 1);
                    console.log("bala destruida. fuera\n");				
                }
                
                else if(move == true){
                    console.log("bala movida\n");
                }
                
                else if((typeof move == "object") && (move instanceof Array)){
                    this.destruirBala(move[0], move[1]);
                }
                
                else{
                    if(move.info.type == "Tanque"){				
                        this._board.vaciaCasilla(this._bullets[i].info.pos.f, this._bullets[i].info.pos.c);
                        this._bullets.splice(i, 1);
                        console.log("bala destruida. tanque");	
                        this._board.getCasilla(move.info.pos.f, move.info.pos.c).Vida = 1;
                        console.log("Tanque "+move.info.name+" acaba de ser disparado. -1 Vida\n");				
                    }
                    
                    else if(move.info.type == "Bala"){
                        //se destruye la bala que se quiere mover
                        this._board.vaciaCasilla(this._bullets[i].info.pos.f, this._bullets[i].info.pos.c);
                        this._bullets.splice(i, 1);
                        
                        //se destruye la bala que ya estaba en la posicion indicada
                        this._board.vaciaCasilla(move.info.pos.f, move.info.pos.c);
                        this.destruirBala(move.info.pos.f, move.info.pos.c);
                        
                        console.log("Se han chocado 2 balas entre si. Ambas fueron destruidas\n");					
                    }
                    
                    else{
                        this._board.vaciaCasilla(this._bullets[i].info.pos.f, this._bullets[i].info.pos.c);
                        this._bullets.splice(i, 1);
                        console.log("bala destruida. roca\n");	
                    }
                }
            }
        }
        this.checkHP();
    }
    
    /**
     * Esta función se encarga de ver si los tanques han alcanzado 0 de vida, y si de eso se trata, 
     * eliminalo de la lista de tanques
     */
    checkHP(){
        //se recorre array de tanques en el juego
        for(let i = 0; i < this._tanks.length; i++){
            console.log("dentro hay: "+this._tanks[i].info.name);
            //si uno de los tanques tiene 0 de vida o menos (por algun motivo)
            if(this._tanks[i].info.v <= 0){
                //se elimina el tanque de la lista de tanques y de la face de la tierra
                console.log("Tanque "+this._tanks[i].info.name+" aniquilado")
                this._board.vaciaCasilla(this._tanks[i].info.pos.f, this._tanks[i].info.pos.c)
                console.log("Pos array: "+i);
                console.log("dentro hay: "+this._tanks[i].info.name);
                console.log("total elementos: "+this._tanks.length)
                this._tanks.splice(i, 1);        
            }
        }    
    }
    
    /**
    * Esta function solo sirve para saber la informacion basica del tablero (filas y columnas) y los elementos existente
    * @param {Player} user - uno jugador
    * @return {Tablero} - un objeto con toda esta informacion
    */
    board(user){    
        let obj = this._board.infoObjs;
        obj.nombre = user.info.user;
        return obj;
    }
}

module.exports = Partida;