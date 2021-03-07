

//Comienzo esperando al evento ready del DOM para ejecutar la función
//inicio ya que necesito que estén creados los elementos del DOM
ons.ready(inicio);

//Seteo una const con la url de la api que usan todos los endpoints de la api
const baseUrl = "http://tiendanatural2020.herokuapp.com/api/";

//Seteo en una variable global el contenido de los 2 filtros, 
//el input search y el qrCode
let searchInput = "";
let barCode = "";

//variable que va a contener el mapa
let mymap;
let myPos;

let productos = []
let productoGlobal;

/**
 * Funcion inicio
 * -Invoco a la función inicioSesionLocalStorage para obtener el id, email del localStorage si hay
 */
function inicio() {
  inicioSesionLocalStorage();

  navigator.geolocation.getCurrentPosition(function (pos) {
    myPos = {lat: pos.coords.latitude, lon: pos.coords.longitude}
  })

}

/**
 * Funcion que inicializa mapa
 */
function prepararMapa() {
  L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWNhaWFmYSIsImEiOiJjanh4cThybXgwMjl6M2RvemNjNjI1MDJ5In0.BKUxkp2V210uiAM4Pd2YWw",
      {
      attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox/streets-v11",
      accessToken: "your.mapbox.access.token"
      }
  ).addTo(mymap);

}

function validarEmail(email){

  var regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  
  if (!regex.test(email)) {
    ons.notification.alert("El correo ingresado no es valido");
  }

}

/**
 * Funcion login, se encarga del logueo del usuario
 *  -Toma los valores del form y valido
 *  -Uso el Conector Ajax (ver comentario función registrar)
 */
function login() {
  
  const txtEmail = $("#loginTxtEmail").val();
  const txtPassword = $("#loginTxtPassword").val();
  
  if (txtEmail === "" || txtPassword === "") {
    ons.notification.alert("Ingrese usuario y password");
    return;
  }

  validarEmail(txtEmail);

  ajaxConnector(
    "POST",
    "user/login",
    JSON.stringify({ email: txtEmail, password: txtPassword }),
    loginHandler,
    errorHandler
  );
}

/**
 * Función ajaxConnector, se encarga de ejecutar la llamada a la api
 * y ejecutar los callbacks correspondientes
 * 
 * Parámetros:
 * -method: string para ver tipo de operación http (GET, POST etc...)
 * -urlEndpoint: string con la url específica de la operación a realizar,
 * dentro de la función se le agrega la baseUrl
 * -data: es el objeto con la información que necesita la api para operar
 * -token: El valor del token si se requiero sino undefined,
 * -successCallback: función que se ejecutará en caso de exito. Como vimos,
 * las funciones tmb son objetos en Js y puedo pasarlas como argumentos de otra función
 * -errorCallback: lo mismo que la anterior pero para el caso de error
 * 
 * Funcionamiento:
 * -Primero analizo si recibi token, en caso de recibirlo seteo el objeto beforeSend.
 * beforeSend ('antes de enviar') es la función que va a setear el token. Como ven, 
 * en este caso siempre se setea con la clave 'x-auth' y el valor del token.
 * -Luego hago la llamada ajax como ya conocemos tomando los valores de los parámetros
 * y ejecutando las funciones correspondientes que se enviaron por parámetro
 * -Se utiliza al principio el elemento #modal_cargando para mostrar un spinner mientras
 * se hace la llamada. Utilizo el callback complete que se ejecutará siempre al final de 
 * cada llamada para apagarle el spinner.
 */
function ajaxConnector(
  method,
  urlEndpoint,
  data,
  succesCallback,
  errorCallback
) {
  
  $("#modal_cargando").show();

  $.ajax({
    type: method,
    url: baseUrl + urlEndpoint,
    data: data,
    dataType:'json',
    //beforeSend: beforeSend,
    contentType: "application/json",
    success: succesCallback,
    error: errorCallback,
    complete: function () {$("#modal_cargando").hide();}
  });
}


/**
 * funcion que se va a usar como callback para los casos de login.
 * Es decir que vamos a pasar esta funcion como parámetro del ajaxConnector
 * en los casos de inicioSesionToken y login
 * 
 * Primero controla que la respuesta tenga token (en el caso de inicioSesionToken no lo tiene)
 * En caso de que tenga lo guarda en el local storage.
 * 
 * Como existe un usuario logueado se utliza la función navegar para ir a la pantalla de home
 */
function loginHandler(response) {

  if (response._id && response.email) {
    window.localStorage.setItem("id", response._id);
    window.localStorage.setItem("mail", response.email);
  }

  ons.notification.alert("Bienvenid@!");
  navegar("home.html", true);
  document.querySelector("#menu-list-header").textContent =
    response.email;
}


/**
 * funcion errorHandler
 * la utilizamos como callback del ajaxConnector para los casos de error
 * por el momento lo único que hace es enviar una alerta con ese mensaje 
 */
function errorHandler(error) {
  navegar("login.html", true);
  ons.notification.alert("Error: Verifique la info ingresada");
}


/**
 * funcion inicioSesionLocalStorage, esta funcion se ejecuta cuando inicia la app
 * -Extrae la info del local storage para ver si hay o no informacion del usuario
 * -Si hay, redirige hacia la vista Home.
 */
function inicioSesionLocalStorage() {

  const idUsuario = window.localStorage.getItem("id");
  const mail = window.localStorage.getItem("mail");

  if (idUsuario && mail) {
    navegar("home.html", true);
  } else {
    navegar("login.html", true);
  }
}

/**
 * Valido si el usuario inició sesión o no, para darle acceso o no a la app
 */
function verificarSesion() {
  const idUsuario = window.localStorage.getItem("id");
  const mail = window.localStorage.getItem("mail");

  if (!idUsuario && !mail) {
    navegar("login.html", true);
    return;
  }else{
    true;
  }
}

/**
 * funcion cerrarSesion, se activa con el botón logout
 * -Borra el local storage asi el usuario no se loguea automáticamente al recargar
 * usando el token.
 * -Utilizamos la función navegar para enviar el usuario nuevamente al login.
 */
function cerrarSesion() {
  window.localStorage.clear();
  navegar("login.html", true);
}


/**
 * Función que controla el componente navigator utilizador para mostrar páginas.
 * Recibe 4 parámetros:
 * -pagina, el string correspondiente al id de la página a la que quiero ir.
 * -reset, un booleano que me indique si quiero que se resetee el stack de paginas del navigator
 * -menu, un booleano que me indique si debo cerrar el menú.
 * -data, el objeto que quiero enviarle a la próxima pantalla en caso de querer hacerlo.
 * 
 */
function navegar(pagina, reset, menu, data) {
  const navigatorComponent = document.querySelector("#nav");
  if (!menu) {
    document.querySelector("#menu").close();
  }
  if (reset) {
    navigatorComponent.resetToPage(pagina, { data: data });
    return;
  }
  navigatorComponent.pushPage(pagina, { data: data });
}

/**
 * Funcion registrar
 * -Obtengo los valores del form
 * -Realizo una verficación ráída
 * -Creo una nueva instancia de la clase Usuairo (ver modelo.js)
 * -invoco a una fucnión auxiliar que hice para no repetir el código
 * de todas las llamadas. A esa funcion la llamé ajaxConnector (Conector Ajax)
 * Esa se encarga de la comunicación con la api y ejecuta las funciones que recibe
 * por parámetro. Ver comentarios de la función.
 */
function registrar() {
  const txtEmail = $("#txtEmail").val();
  const txtPassword = $("#txtPassword").val();

  if (
    txtEmail.length === 0 ||
    txtPassword.length === 0
  ) {
    errorHandler();
    return;
  }

  const nuevoUsuario = new Usuario(
    txtEmail,
    txtPassword
  );

  ajaxConnector(
    "POST",
    "user/register",
    nuevoUsuario.getString(),
    function() {
      ons.notification.alert("Registrado Correctamente");
      navegar("login.html", true);
    },
    errorHandler
  );
}


/**
 * Función que selecciona el componente menú y lo abre
 */
function openMenu() {
  if(verificarSesion){
    document.querySelector("#menu").open();
  }
}
/**
 * Función que selecciona el componente menu y lo cierra
 */
function closeMenu() {
  if(verificarSesion){
    document.querySelector("#menu").open();
  }
}

/**
 * Funcion para obtener todos los productos. En caso de success llamo a la funcion
 * armarTablaProductos para que se muestre la info
 */
function obtenerProductos() {
  if(verificarSesion){
    ajaxConnector(
      "GET",
      "product/all",
      undefined,
      armarTablaProductos,
      errorHandler
    );
  }
}

/**
 * Recorro el response y armo una fila para cada producto,
 * ubicando imagen, nombre, precio, cantidad de sucursales en las que hay stock.
 * 
 * Filtros:
 * -Si hay contenido en searchInput analiza si el nombre del producto en minúscula,
 * incluye al filtro. Si no es así retorna descartando armar fila para ese producto.
 */
function armarTablaProductos(response) {
  productos = response;
  const productosList = $("#productos-list");
  productosList.html("");
  let htmlLista = "<ons-list-header>Productos</ons-list-header>";

  response.forEach(function(r) {
    if (
      searchInput &&
      !r.name.toLowerCase().includes(searchInput.toLowerCase())
    ) {
      return;
    }

    const producto = new Producto(
      r._id,
      r.name,
      r.description,
      r.price,
      r.photo,
      r.branches
    );

    htmlLista += `
                  <ons-list-item ripple>
                    <div class="left">
                      <img class="list-item__thumbnail" src="${producto.foto}"
                      onerror = "this.src = './img/default.png'"
                      >
                    </div>
                    <div class="center"
                    onclick = "verDetalle('${producto._id}')"
                    >
                      <span class="list-item__title">${producto.nombre}</span>
                      <span class="list-item__subtitle">${producto.descripcion}</span>
                      <span class="list-item__subtitle">${"Cantidad de sucursales: " + producto.sucursales.length}</span>
                    </div>
                  </ons-list-item>
                  `;
  });
  
  productosList.append(htmlLista);
}

/**
 * Función que se asocia al evento click de la fila del producto para 
 * ir a el detalle de un producto.
 * En este caso el succes callback se construye con una función anónima en la misma
 * invocación. 
 */
function verDetalle(_id) {
  if(verificarSesion){
    const producto =  productos.find(function(p) {
      return p._id === _id;
    });
    productoGlobal = producto;
    navegar("producto.html", false, false, producto);
  }
}

/**
 * Función para mostrar los detalles de un producto
 * Se invoca a la función buscar dirección con la dirección del usuario
 */
function mostrarDetalles() {
  let producto;
  if(mymap != undefined && !searchSucursalesInput){
    mymap.remove();
    producto = productoGlobal;
  }

  if(searchSucursalesInput && searchSucursalesInput != ""){
    mymap.remove();
    producto = productoGlobal;
  }else{
    if(producto == undefined){
      producto = this.data;
    }
    
  }
  mymap = new L.map("mapid").setView([51.505, -0.09], 15);

  mymap.eachLayer((m) => m.remove());
  prepararMapa();
  
  $("#producto-nombre").html(producto.name);
  $("#producto-detalle").html(producto.description);
  $("#producto-precio").html(producto.price);

  if (
    searchSucursalesInput
  ) {
    dibujarBranches(producto.branches, searchSucursalesInput);
    return;
  }else{
    dibujarBranches(producto.branches, "");
  }
}

/**
 * Recorre las sucursales
 * 
 * Para cada una calcula la distancia que hay respecto a la posición del usuario
 * y guarda el resultado en metros en la variable distance
 * Luego agrega el marcador al mapa con el nombre de la sucursal y la distancia en km con 3 decimales.
 */
function dibujarBranches(sucursales, distancia){
  sucursales.forEach(function (b){
    const distance = L.GeometryUtil.length([L.latLng(myPos.lat, myPos.lon), L.latLng(b.latitude, b.longitude)])
    distanceKm = distance / 1000;
    if(distanceKm <= distancia){
      agregarMarcador(b.latitude, b.longitude, `${b.name}<br>${(distanceKm).toFixed(3)} km`)
      return;
    }else{
      if(distancia == ""){
        agregarMarcador(b.latitude, b.longitude, `${b.name}<br>${(distanceKm).toFixed(3)} km`)
      }
      
    }
  })

  agregarMarcador(myPos.lat, myPos.lon, 'Yo');

}

/**
 * Agrega el marcador con la lat,long pasada.
 * Agrega un pop up con el texto recibido
 */
function agregarMarcador(latitud, longitud, txtPopup){

  mymap.setView([latitud, longitud],13);

  L.marker([latitud, longitud]).addTo(mymap)
  .bindPopup(txtPopup);

}

/**
 * Función para guardar búsqueda.
 * Recibe el string de búsqueda, si el string no existe en la base de datos, lo inserta, sino, actualiza la fecha
 */
function guardarBusqueda() {
  if(verificarSesion){
    console.log("searchInput: " + searchInput);
    if(searchInput){
        const idUsuario = window.localStorage.getItem("id");
        const email = window.localStorage.getItem("mail");
        if(existe_busqueda(idUsuario, searchInput, function(resultado) {
          if(resultado){
            actualizar_busqueda(idUsuario, searchInput);
          }else{
            agregar_busqueda(idUsuario, email, searchInput, function(resultado) {
              if (resultado) {
                ons.notification.toast("Se ha guardado la busqueda", { timeout: 1000 });
              } else {
                ons.notification.alert("Error al guardar la busqueda");
              }
            })
          }
        }));
    }
  }
}

/**
 * Función para actualizar búsqueda.
 */
function cb_actualizar_busqueda(existe, stringBusqueda) {

  const idUsuario = window.localStorage.getItem("id");

  if(existe){
    actualizar_busqueda(idUsuario, stringBusqueda);
    ons.notification.toast("Se ha actualizado la busqueda", { timeout: 1000 });
  }else{
    ons.notification.alert("Error al actualizar la busqueda");
  }

}

/**
 * Función para obtener busquedas
 * Utiliza la función del archivo db para obtener las búsquedas y
 * se le pasa el callback que se quiere ejecutar en caso de que 
 * se logre traer las búsquedas.
 */
function obtenerBusquedas() {
  if(verificarSesion){
    const idUsuario = window.localStorage.getItem("id");
    listado_usuarios_busquedas(idUsuario, armarBusquedas);
  }
}

function armarBusquedas(busquedas) {
  busquedas = [...busquedas];
  const busquedaList = $("#busquedas-list");
  busquedaList.html("");
  let htmlLista = "<ons-list-header>Busquedas Realizadas</ons-list-header>";
  busquedas.forEach(function(r) {
    htmlLista += `
                  <ons-list-item ripple>
                    <div class="center">
                      <span class="list-item__title">${r.busqueda}</span>
                      <span class="list-item__subtitle">${r.fecha}</span>
                    </div>
                    <div class="right">
                      <ons-icon icon="md-delete" 
                      onclick="eliminarBusqueda('${r.idUsuario}','${r.busqueda}')"
                       class="list-item__icon"></ons-icon>
                    </div>
                  </ons-list-item>
                  `;
  });

  busquedaList.append(htmlLista);
}

/**
 * Función para eliminar una búsqueda.
 * Recibe el idUsuario y el string de la búsqueda
 * Utiliza la función elminar busqueda
 */
function eliminarBusqueda(idUsuario, busqueda) {
  
  eliminar_busqueda(idUsuario, busqueda);
}

/**
 * Función que se engancha al evento click del botón de la cámara.
 * Ejecuta el plug in de cordova con distintos parámetros.
 */
function scanCode() {
  if(verificarSesion){
    try{
      cordova.plugins.barcodeScanner.scan(
        //success
        scanCallback,
        //error
        function(error) {
          ons.notification.toast("Error durante escaneo " + error, {
            timeout: 3000
          });
        },
        {
          //Algunas configuraciones,
          //https://www.npmjs.com/package/phonegap-plugin-barcodescanner
          preferFrontCamera: false, // camara frontal por defecto
          showFlipCameraButton: false, // mostrar switch de camara
          torchOn: false, // lanzar scan con linterna
          prompt: "Coloque QR dentro de la zona de escaneo", //mensaje que se muestra en pantalla
          orientation: "portrait" // (portrait|landscape)
        }
      );
    }catch(e){
      ons.notification.toast(e, { timeout: 23000 });
    }
  }
}

/**
 * Callback de exito para el scan del QR.
 * El objeto retornado puede tener los siguientes atributos
 * 
 * -cancelled indica si fue cancelado por el usuario
 * -format indica el formato de lo scaneado en este caso un QR_CODE
 * -text: a los fines del taller siempre va a contener el texto del QR, con los ingredientes
 * -Se transforma al objeto con la función JSON.parse(result.text); 
 * -Luego se llama a la funcion obtenerIngredientes para mostrar en un alert el contenido del Codigo QR
 */
function scanCallback(result) {

  try {
    //si no cancela usuario
    if (result.cancelled) {
        navegar("home.html", true);
        ons.notification.toast("Cancelado por el usuario", { timeout: 3000 });
        return;
    }
    if (result.format != "QR_CODE") {
        navegar("home.html", true);
        ons.notification.toast("No es codigo QR", { timeout: 3000 });
        return;
    }
    barCode = JSON.parse(result.text);
    obtenerIngredientes();
  } catch (e) {
    ons.notification.toast(e, { timeout: 3000 });
  }
}

/**
 * Esta función muestra en un alert el contenido del codigo QR
 * - Con el foreach recorro la lista de ingredientes y lo voy concatenando en una variable de tipo
 * String
 */
function obtenerIngredientes(){

  let ingredientes = "";
  const producto =  productos.find(function(p) {
    return p._id === barCode._id;
  }); 
  
  barCode.ingredientes.forEach(function(b) {

    ingredientes += b + ", ";

  });
  ons.notification.alert({
    message: "Ingredientes: " + ingredientes,
    title: producto.name
  });
}



