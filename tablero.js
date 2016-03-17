"use strict"
var Casilla = require('./casilla.js');
var Elemento = require('./elementos.js');
class Tablero {
  constructor(nf, nc) {
    this._nf = nf;
    this._nc = nc;
    this._time=0;
    this._filas = new Array(nf);
    for (let i = 0; i < nf; i++) {
      this._filas[i] = new Array(nc);
      for (let j = 0; j < nc; j++) {
        this._filas[i][j] = new Casilla(i, j);
      }

    }
  }
  /**
   * get y set de time 
   */
  get time(){
      return this._time
  }
  set time(time){
		this._time = time;
	}
  /*
   * devuelve un objeto con las filas y columnas del tablero
   */
  get Dimensiones(){
	
		return ({filas:this._nf,
         columnas:this._nc
         });
	}
	
  
  
  /** 
   * obtine un array de todas las posiciones ocupadas
   */

  get Contenido() {
    let set = [];
    for (let i = 0; i < this._nf; i++) {
      for (let j = 0; j < this._nc; j++) {
        if (this._filas[i][j].in) {
          set.push(this._filas[i][j].pos);

        }
      }
    }
    return set;
  }
 /*
   * devuelve un objeto {board:con las dimensiones de tablero}
   * e info que es un array con la informacion de las casillas 
   * ocupadas
   * 
   */
  get infoObjs() {
    let arrayElementos = [];

    let board = {
      f: this._nf,
      c: this._nc
    }

    for (let i = 0; i < this._nf; i++) {
      for (let j = 0; j < this._nc; j++) {


        if (this._filas[i][j].in) {
          arrayElementos.push({
          info: this._filas[i][j].in.info

          });





        }
      }

    }
    return {

      board: board,
      info: arrayElementos
    };

  }

/*
   *  
   * Funcion que recibe como parametros fila y columna 
   * y devuelve el contenido
   * null si esta vacia
   */

  getCasilla(f, c) {
    return this._filas[f][c].in
  }

/*
   *  
   * Funcion que recibe como parametros fila , columna y contenido
   * si esta ocupada devuelve false
   * si esta vacia pone el valor del contenido que le hemos pasado al  contenido de esta
   */
  setCasilla(f, c, contenido) {
    if (this._filas[f][c].in) {
      return false;
    }
    else {
      this._filas[f][c].in = contenido;
      return true;
    }
  }



  Girar(f, c, di) {
    switch (di) {
      case "i":

        if (this._filas[f][c].in.info.o == 'o') {
          this._filas[f][c].in.Orientacion = 's';
          console.log("giro de O a S ")
          return true;
        }
        if (this._filas[f][c].in.info.o == 'n') {
          this._filas[f][c].in.Orientacion = 'o';
          console.log("giro de N a O ")
          return true;
        }
        if (this._filas[f][c].in.info.o == 'e') {
          this._filas[f][c].in.Orientacion = 'n';
          console.log("giro de E a N ")
         return true;
        }
        if (this._filas[f][c].in.info.o == 's') {
          this._filas[f][c].in.Orientacion = 'e';
          console.log("giro de S a E ")
          return true;
        }

      case "d":
        if (this._filas[f][c].in.info.o == 'n') {
          this._filas[f][c].in.Orientacion = 'e';
          console.log("giro de N a E ")
          return true;
        }
        if (this._filas[f][c].in.info.o == 'e') {
          this._filas[f][c].in.Orientacion = 's';
          console.log("giro de E a S ")
          return true;
        }
        if (this._filas[f][c].in.info.o == 's') {
          this._filas[f][c].in.Orientacion = 'o';
          console.log("giro de S a O ")
          return true;
        }
        if (this._filas[f][c].in.info.o == 'o') {
          this._filas[f][c].in.Orientacion = 'n';
          console.log("giro de O a N ")
          return true;
        }

    }
  }

			


  Mover(f, c, d) {
    let filas = f;
    let columnas = c;
    

    switch (d) {
      case 'n':
        if (f == 0) {
          console.log("\nIntenta moverse hacia fuera del tablero.");
          break;
        } else {

          filas--;
          console.log("\nOrientacion: Norte");
          break;
        }

      case 's':
        if (f == this._nf - 1) {
          console.log("\nIntenta moverse hacia fuera del tablero.");
          break;
        } else {
          filas++;
          console.log("\nOrientacion: Sur");
          break;
        }

      case 'o':
        if (c == 0) {
          console.log("\nIntenta moverse hacia fuera del tablero.");
          break;
        } else {
          columnas--;
          console.log("\nOrientacion: Oeste");
          break;
        }

      case 'e':
        if (c == this._nc - 1) {
          console.log("\nIntenta moverse hacia fuera del tablero.");
          break;
        } else {
          columnas++;
          console.log("\nOrientacion: Este")
          break;
        }
    }
  if(filas == f && columnas == c){
          //hacia fuera
			console.log("se mueve hacia fuera del tablero");
			return false
		}
		console.log("Se esta moviendo ("+f+","+c+") a ("+filas+","+columnas+")");
			
		if(!this._filas[filas][columnas].in){				
			this._filas[f][c].in.Fila = filas;
			this._filas[f][c].in.Columna = columnas;
			this._filas[filas][columnas].in = this._filas[f][c].in;
			this._filas[f][c].in = null;
			console.log("Se ha movido correctamente a la posicion indicada\n");
			return true;
		}
			
		else{
            //si se choca contra un tanque
			if(this._filas[filas][columnas].in.info.type == "Tanque"){
				console.log("Posicion indica esta ocupada por un tanque.");
				return this._filas[filas][columnas].in;
			}
			
            //si se choca contra una roca
			else if(this._filas[filas][columnas].in.info.type == "Roca"){
				console.log("Posicion indica esta ocupada por una roca.");
				return this._filas[filas][columnas].in;
			}
			
            //si no se cumple uno de los dos casos anteriores
			else{
				console.log("Posicion indicada esta ocupada por una bala.");
				
				if(this._filas[f][c].in.info.type == "Tanque"){//si lo que se esta moviendo es un tanque
					this._filas[f][c].in.Vida = 1;//se le quita menos 1 de vida al tanque 
					this._filas[f][c].in.Fila = filas;
					this._filas[f][c].in.Columna = columnas;
					let bala = this._filas[filas][columnas].in;
					this._filas[filas][columnas].in = this._filas[f][c].in;
					this._filas[f][c].in = null;
					console.log("Se ha movido correctamente a la posicion indicada, pero ha perdido vida por ir contra una bala\n");
					let array;
					array.push(bala.info.pos.f, bala.info.pos.c);
                    //se devuelve el tal array
					return array;
				}
				else{//si lo que se esta moviendo es una bala
                    //se devuelve la bala que no se está moviendo
					return this._filas[filas][columnas].in; 
				}
			}
		}
  }
      
  
/*
   *  
   * Funcion que recibe como parametros fila y columna 
   * y pone su contenido a null
   */
  vaciaCasilla(f, c) {
    this._filas[f][c].in = null;
  }

}
module.exports = Tablero;
