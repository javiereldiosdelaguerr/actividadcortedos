# ------------------------------------------------------------------------------------------------
# Sistema distribuido: SISTEMA DE VOTACIÓN WEB

# Permite el voto y seleccion de opciones como creacion de lista personalizada.

# ------------------------------------------------------------------------------------------------
# DISEÑO:

#  Diseño de tres capaz, pantalla, logica y datos
# FrontEnd: Muestra al usuario toda la información WEB.
# BackEnd: Procesa logica de votos y realiza peticiones.
# BD: Almacena la información.


# ------------------------------------------------------------------------------------------------
# ¿CÓMO SE COMUNICAN LOS SERVICIOS?:

# FrontEnd - BackEnd: Por medio de peticiones de tipo HTTP.
# BackEnd - BD: Usa MYSQL para conectarse.
# La comunicación Docker se realiza usando nombres de los servicios por red interna.


# ------------------------------------------------------------------------------------------------
# ¿QUÉ PASA SI FALLA?
# Si el back falla, no se procesan las peticiones.
# Si el front falla, limita o niega la interacción con el usuario.


# ------------------------------------------------------------------------------------------------
# DEFINICIÓN DE SERVICIOS:
# Servicio WEB
# Servicio Backend
# Servicio Frontend
# NOTA: la BD se rea mediante MYSQL_DATABASE y se inicializa con el init.sql


# ------------------------------------------------------------------------------------------------
# ANALISIS
# ------------------------------------------------------------------------------------------------
# Rol de cada servicio:

# Backend: Procesa la logica de las peticiones 
# Frontend: Interactua con el usuario/muestra la interfaz.
# BD: Se encarga de todo lo que es almacenamiento.


# ------------------------------------------------------------------------------------------------
# Ventajas de la división:

# Al dividir el sistema se asegura poder mantenerlo de forma independiente y por partes pequeñas optimizando tiempo de revisión y busqueda de errores sin dejar a un lado la escalabilidad, el orden y el poder de reutilizar recursos.


# ------------------------------------------------------------------------------------------------
# COMUNICACIÓN DE CONTENEDORES:

# Los contenedores se conectan por su red interna usando los nombres de los servicios por ejemplo en el proyecto : db

 
# ------------------------------------------------------------------------------------------------
# VARIABLES DE ENTORNO:

# Las variables de entorno se utilizan para la configuración del aplicativo y no afectar el codigo, se usan en caso de contraseñas, usuarios, direcciones, Keys, que pueden ser llamadas e importadas desde .env.

# en el proyecto se ven aplicadas a:
# environment:
  # MYSQL_ROOT_PASSWORD: 1234
  # MYSQL_DATABASE: votacion


# ------------------------------------------------------------------------------------------------
# CONEXION A BASE DE DATOS:
# Para conectar una base de datos se requiere de un cliente o libreria en este caso fue MYSQL en node.js utilizando datos como: 
# Nombre de la base de datos, usuario, contraseña, host(nombre del servicio en este caso).


# ------------------------------------------------------------------------------------------------
# POSIBLES ERRORES:
# Credencfiales incorrectas.
# Problemas con la red Docker.
# El servicio no este corriendo correctamente.

# ------------------------------------------------------------------------------------------------
# COMANDOS UTILES
# ------------------------------------------------------------------------------------------------
# Entrar al contenedor BD
- docker-compose exec db mysql -u root -p
- use votacion;
- SHOW TABLES;
- SELECT * FROM ;