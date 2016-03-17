"use strict"

class Roca{
	constructor(f,c){
		this._fila = f;
		this._columna = c;
		this._tipo = "Roca";
	}
	
	get info(){
		return({pos:{f:this._fila, c:this._columna}, type:this._tipo});
	}
	
}

class Tanque{
	
	constructor(info){
		this._orientacion = null;
		this._fila = null;
		this._columna = null;
		this._nombre = info.tank.nombre;
		this._vida = info.tank.vida;
		this._id = info.tank.id;
		this._tipo = "Tanque";
		this._selected = false;
	}
	
	get info(){
	
		return ({pos:{f:this._fila, c:this._columna}, name:this._nombre, o:this._orientacion, v:this._vida, type:this._tipo, id:this._id});
	}
	
	get select(){
		return this._selected;
	}
	
	get dbInfo(){
			
		return ({name:this._nombre, v:this._vida, type:this._tipo, id:this._id, _id:this._mongoid});
	}
		
	set Fila(f){
		this._fila = f;
	}
	
	set Columna(c){
		this._columna = c;
	}
	
	set Orientacion(o){
		this._orientacion = o;
	}
	
	set Vida(dmg){
		this._vida -= dmg;
	}
	
	set select(state){
		this._selected = state;
	}
}

class Bala{
	constructor(f,c,o){
		this._fila = f;
		this._columna = c;
		this._orientacion = o;
		this._tipo = "Bala";
	}
	
	get info(){
		return({pos:{f:this._fila, c:this._columna}, o:this._orientacion, type:this._tipo});
	}

	set Fila(f){
		this._fila = f;
	}
	
	set Columna(c){
		this._columna = c;
	}
}

module.exports={
Tanque:Tanque, 
Bala:Bala,
Roca:Roca
}
