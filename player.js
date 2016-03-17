"use strict"
//Esta es la clase Player
class Player{
	constructor(id, user, nombre){
		this._id = id;
		this._user = user;
		this._nombre = nombre;
		this._tanques = new Map();
		this._token = "";
		this._date = null;
		this._gender = null;
		this._mail = null;
        this._idArch = null;
	}	
	
	//SETTERS
	set token(valor){
		this._token = valor;
	}
	
	set name(nombre){
		this._nombre = nombre;
	}
	
	set date(fecha){
		this._date = fecha;
	}
	
	set mail(correo){
		this._mail = correo;
	}
	
	set gender(sexo){
		this._gender = sexo;
	}
	
	//GETTERS
	get tanques(){
		return Array.from(this._tanques);
	}
    
    get numTanques(){
        return this._tanques.size
    }    
	
	get profile(){
		return {
			user: this._user,
			id: this._id
		}
	}
	
	get token(){
		return this._token;
	}
	
	get info(){
		return {
			id: this._id,
			user: this._user,
			name: this._nombre,
			mail: this._mail,
			date: this._date,
			gender: this._gender,
			tanks: this._tanques,
			token: this._token
		}
	}
		
	//FUNCIONES
	getTanque(id){
		return this._tanques.get(id);
	}
	
	selectTanque(id){
		for(let tanques of this._tanques.values()){
			console.log("cheking: "+tanques.info.id);
			if(tanques.select){
				tanques.select = false;
				console.log("Deseleccionado tanque "+tanques.info.id)
				break;
			}
		}
		console.log("Hay "+this._tanques.size+" tanques en el map");
		let selected = this._tanques.get(id);
		if(!selected){
			console.log("No se ha encontrado el tanque con id "+id);
			for(let k of this._tanques.keys()){
				console.log("Existe el tanque "+k);
				if(k === id){
					console.log("Este es el tanque que buscábamos");
				} else if(k == id){
				  console.log("Son iguales pero no iguales del todo");
				  console.log(typeof k);
				  console.log(typeof id);	
				} else {
					console.log("No es lo mismo "+k+" que "+id);
				}
				let t = this._tanques.get(k);
				console.log("Que es "+JSON.stringify(t.info));
			}
		} else {
			console.log("Seleccionado tanque "+selected.info.name);
			selected.select = true;			
		}
	}
	
	addTanque(id, tanque){
		this._tanques.set(id, tanque);
        console.log("Añadido tanque de id "+id+".");
        console.log("Ahora tengo "+this._tanques.size+" tanques")
	}
    
    setIdArch(_id){
        this._idArch = _id;
    }
    
    getInfoArch(uid){
        return {
            _id: this._idArch,
            id: uid,
            tanques: this.tanques 
        }
    }
}

function guardarTanques(obj, f){
    if(obj._id){
        return
    }
}

module.exports = Player;