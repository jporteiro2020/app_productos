var tamanio = 1024*1024*5
//creo conexion a base de datos
//si creo bd con version por ej. 1, no puedo cambiarla
var db = window.openDatabase("busquedas", "", "se guardara las busquedas", tamanio, function(){
    //se ejecuta codigo cuando se crea la BD.
    db.transaction(function(tx){
        tx.executeSql("CREATE TABLE if not EXISTS busqueda (idUsuario varchar(50), email varchar(100), busqueda varchar(250), fecha TEXT)");
    },
    //si hay error recibo exception
    function(e){
        console.log(e.message);
    },
    function(){
        //si transaccion ok
    }
    );
});

if(db.version == ""){
    console.log("Estoy en primer version de BD");
    db.changeVersion("","1.0", function(tx){
        //actualizaciones de BD cuando cambio a BD 1.0
        //por ejemplo ALTER, CREATE, Agregar info, etc.
    });
}
else if (db.version == "1.0"){
    console.log("Estoy en version 1.0");
}

function existe_busqueda(idUsuario, busqueda, cb){
        db.transaction(function(tx){
        //verifico si la busqueda ya existe.
        var sql = "SELECT * FROM busqueda WHERE idUsuario = ? and busqueda = ?";
        tx.executeSql(sql, [idUsuario, busqueda.toUpperCase()], function(tx, result){
            if(result.rows.length == 0){
                cb(false, busqueda);
            }
            else{
                cb(true, busqueda);
            }            
        });
    }, function(e){
        console.log(e);
    });
}

function agregar_busqueda(idUsuario, email, busqueda, callback){
     const fecha = new Date();
     const fechaInsertar = fecha.getDate() + "/" + fecha.getMonth() + "/" + fecha.getFullYear() + " - " + fecha.getHours() + ":" + fecha.getMinutes() + ":" + fecha.getSeconds();;
     db.transaction(function(tx){
         var sql =  "INSERT INTO busqueda (idUsuario, email, busqueda, fecha) VALUES (?,?,?,?)";
         var datos = [idUsuario, email, busqueda.toUpperCase(), fechaInsertar];
         tx.executeSql(sql, datos, function(tx, result){
            if(result.insertId > 0){
                callback(true);
            }else{
                callback(false);
            }
         });
     },function(e){
         console.log(e);
     });
}

//Esta función la utilizo para actualizar la fecha de la búsqueda siempre y cuando el usuario vuelva a buscar 
//un string ya existente en la base de datos
function actualizar_busqueda(idUsuario, busqueda, callback){
    const fecha = new Date();
    const fechaActualizar = fecha.getDate() + "/" + fecha.getMonth() + "/" + fecha.getFullYear() + " - " + fecha.getHours() + ":" + fecha.getMinutes() + ":" + fecha.getSeconds();
    db.transaction(function(tx){
        var sql =  "UPDATE busqueda SET fecha = ? where idUsuario = ? and busqueda = ?";
        var datos = [fechaActualizar, idUsuario, busqueda.toUpperCase()];
        tx.executeSql(sql, datos, function(tx, result){
            ons.notification.toast("Se ha actualizado la busqueda", { timeout: 1000 });
        });
    },function(e){
        console.log(e);
    });
}

function eliminar_busqueda(idUsuario, busqueda){
     db.transaction(function(tx){
         var sql =  "DELETE FROM busqueda WHERE idUsuario = ? and busqueda = ?";
         var datos = [idUsuario, busqueda.toUpperCase()];
         tx.executeSql(sql, datos, function(tx, result){
         ons.notification.toast("Se ha eliminado la busqueda", { timeout: 1000 });
         });
     },function(e){
         ons.notification.alert("Error al eliminar la busqueda");
         console.log(e);
     });
}

function listado_usuarios_busquedas(idUsuario, cb){
     db.transaction(function(tx){
         var sql =  "SELECT idUsuario, busqueda, fecha FROM busqueda where idUsuario = ? order by fecha DESC";
         tx.executeSql(sql, [idUsuario], function(tx, result){
             cb(result.rows);
         });
     },function(e){
         console.log(e);
     });
}