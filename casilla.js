"use strict"

class Casilla{
	/**Casillas del juego,compuestas cada una por una posicion su fila y su columna
	 * @param 1-f
	 * @param 2-c
	 * dentro estas dos de un objeto posicion
	 * contenido de la casilla al empezar vacio
	 **/
	constructor(fila, columna){
		this._posicion = {
			f: fila, 
			c: columna};
		this._in = null;
	}
	/*devuelve un objeto de tipo posicion*/
	
	get pos(){
		return this._posicion;
	}
	
	/*devuelve un objeto de tipo contenido*/
	
	get in(){
		return this._in;
	}
	
	set in(valor){
		this._in = valor;
	}
}

module.exports = Casilla;