/**
 * Clase Model, me interesa que tengan un método
 * que retorne el JSON.stringify para no hacerlo en cada petición
 * 
 * Usuario, Producto, Sucursal van a heredar de Model
 */

class Model {

    constructor(_id = ''){
        this._id = _id;
    }

    getString(){
        return JSON.stringify(this);
    }
}

/**
 * Clase Usuario hereda de Model
 */
class Usuario extends Model {

    constructor(email, password){
        super();
        this.email = email;
        this.password = password;

    }
}

class Producto extends Model{
    constructor(_id, nombre, descripcion, precio, foto, sucursales){
        super(_id);
        this._id = _id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.foto = foto;
        this.sucursales = sucursales;
    }
}

class Sucursal extends Model{
    constructor(_id, nombre, latitud, longitud){
        super(_id);
        this.nombre = nombre;
        this.latitud = latitud;
        this.longitud = longitud;
    }
}