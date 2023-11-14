Descripción del proyecto: 
Crescendo es un sistema revolucionario que llega para transformar las fiestas en experiencias interactivas, permitiendo a los participantes sugerir canciones al DJ de forma rápida y sencilla a través de un código QR. Con la ayuda de este sistema, el DJ obtendrá insights para personalizar su música y llevar la fiesta a otro nivel. 

Objetivo de la plataforma: 
El objetivo principal de este proyecto es poder innovar sobre la dinámica en la forma en que se pasa música en los eventos sociales. Por un lado, brindamos una solución a ese público que suele no sentirse totalmente identificado con la música que se pasa en el evento y le damos la posibilidad de ser parte y poder hacer llegar sus sugerencias al Dj. Por otro lado entendemos que parte del trabajo de los Dj es identificar a su público y pasar la música más acorde posible para llevar la fiesta a su máximo potencial. Con Crescendo, los Dj tienen la posibilidad de conocer a su público a través de nuestra plataforma donde las prioridades son tres: simpleza, funcionalidad y velocidad. 
Consideramos de suma importancia que el Dj tenga la última palabra sobre la música que se pasa en su fiesta, por eso le damos la posibilidad de aceptar y rechazar los pedidos de canciones que le hace el público. Todos ganan, a todos les conviene y por sobre todo, potenciamos la experiencia musical. 


Funcionalidades público: 
Buscador de canciones que utiliza la api de spotify para elegir entre más de 80 millones de canciones. 

PerfilDj es una página donde los usuario tienen acceso a distintas estadísticas del Dj. Pueden ver la cantidad de fiestas, canciones, canciones aceptadas, género de música más aceptado y un historial con todas las fiestas y canciones pedidas. 

Ver las canciones pedidas. Le mostramos al publico todas las canciones pedidas y sus respectivos estados que pueden ser: pendiente, aceptado o rechazado. 	

Funcionalidades Dj: 
Login - Register. Accediendo a nuestra página permitimos que todos los Dj se puedan registrar o loguearse para acceder a aquellas páginas que requieren autorización. 

Historial de fiestas donde mostramos al Dj todos los eventos pasados.
Crear fiestas, una vez autorizados los Dj podrán crear todas las fiestas deseadas.
La fiesta. En esta pagina los dj podrán ver todos los pedidos de canciones y eventualmente las podrán rechazar o aceptar. 
QR. Por cada fiesta hay un código qr distinto, el dj tiene la opción de descargarlo o compartirlo directamente desde la página web. 






Herramientas utilizadas durante el desarrollo: 
Api spotify 
Visual Studio 
Workbench Mysql 
Api REST - Nodejs - Express
Github 
ChatGPT
Figma 
PhpMyAdmin 
Postman
Cyclic
Vercel 
Pinterest 

Roles y dificultades: 

Full-stack
Desarrollo de la api entera (14 endpoints + middleware)
Materialización lógica de las funcionalidades del proyecto
Manejo de datos (username, tokens, party_id, etc…) desde el front y llamados a la api. La mayoría de las veces por la url o localstorage. 
 Seguridad de la web y sistema de autenticación. Sistema de access y refresh tokens, middleware, uso de cookies (HttpOnly) y localstorage en el front. 
Diagramación del funcionamiento de la plataforma plantéo soluciones para cada funcionalidad. 
Planteo de la base de datos junto con la desarrolladora de back end. 

Las mayores dificultades fueron:
Asimilar el concepto de api rest, entorno desarrollo y framework. 
Comprender cómo usar la api de spotify, el primer logro fue hacer funcionar el buscador. 
Programar el sistema de autenticación fue otra dificultad ya que luego de programar todo nos dimos cuenta que Iphone no acepta las HttpOnly cookies y tuve que rearmar toda la lógica de autenticación y seguridad nuevamente. 
En un principio el sistema estaba pensado para que cada dj tiene una fiesta. Al cambiar esto decidimos armar un historial de canciones. Para eso programe un endpoint que buscaba todas las fiestas del Dj y luego iba fiesta por fiesta a buscar las canciones y por cada canción se hacía un request a la api de spotify para obtener los datos necesarios como la foto, titulo, etc… Spotify bloquear nuestra cuenta por superar su rate limit asi que utilizamos un sistema de cache para no hacer request sobre canciones repetidas. 
Lo mismo pasó cuando quisimos averiguar el género de las canciones más aceptadas por el dj y volvimos a utilizar el cache. 
Problemas de CORS. Estos problemas son los más difíciles de descifrar y resolver, hubieron días enteros durante los cuales estuve trabajando en un mismo error de CORS que al solucionarlo aparecía otro diferente. 



Front-end

 Pantalla con 3 Secciones: Diseñar e implementar una pantalla dividida en tres secciones para gestionar peticiones implicó coordinar la lógica de presentación y la interactividad entre estas áreas.

 Gestión de Estados Dinámica: Chequear y cambiar dinámicamente los estados de las peticiones (pendientes, aceptadas, rechazadas) presentó dificultades en la sincronización de este cambio, más que nada porque cuando las canciones se encuentran en la sección “Pendientes” se le permite al dj rechazarla o aceptarla, en cambio al estar en cualquiera de las otras dos secciones nada mas la canción figura como muestra de cuales acepto o rechazo .

Experiencia de Usuario: Adoptamos un enfoque mobile-first porque crescendo está completamente pensado y diseñado para usar sola y exclusivamente en celular de la manera mas optima.

Back-end:


Base de Datos:
- Gestión y optimización de la base de datos para un acceso eficiente.

- Alojamiento en Cyclic y Vercel:
  - Despliegue de la API en Cyclic.
  - Despliegue del front-end en Vercel para garantizar un acceso rápido y confiable.

Optimización del Código:
- Identificación y aplicación de mejoras en el código para incrementar la velocidad de ejecución.

Actualización en Tiempo Real:
- Implementación de un `setInterval` para visualizar las canciones sin necesidad de recargar la página.

Funcionalidades Adicionales:
- Integración de botones para compartir y guardar códigos QR.

Dificultades Técnicas:

- Set Interval para Actualización Automática: Requiere una implementación precisa para asegurar la sincronización y eficiencia.
- Botón de Guardar QR: Necesita una manipulación cuidadosa de la lógica del sistema para garantizar un funcionamiento correcto.
- Alojamiento Manual en Cyclic: Añade una complejidad adicional, demandando atención a los detalles y conocimientos técnicos avanzados.


Arte, diseño :

- Diseño de toda la interfaz de usuario y DJ, creando todas las pantallas de principio a fin, desde el fondo hasta los botones y pensamiento de las animaciones de botones y demas.
- Creación del logo 
- Estética profesional con toque minimalista

Dificultades técnicas:

-Cero experiencia previa: jamás había diseñado una página web ni una aplicación (solo en pixel art), y además sabía muy poco de figma y sus utilidades, y me llevo tiempo empezar a diseñar de una manera más atractiva y con más facilidad, al principio las pantallas me costaban mucho y no me gustaba como eran. 

- Primera pantalla: me costó mucho realizarla ya que no tenía una idea clara de lo que estábamos buscando y eso llevó a que me tardara más tiempo del esperado, pero luego de un momento de pensar bien a lo que apuntábamos se me hizo mucho más fácil realizarla, y una vez creada la primera pantalla, todas las demás se hicieron mucho más sencillas.

- Creación del logo: la primeras semanas me centralice mucho en la creación del logo, lo cual no me dejo avanzar mucho con las pantallas, y estaba siendo un problema ya que el front no podía hacer nada, asi que lo deje de lado la mayoría del proyecto hasta casi el final, donde luego de 20/30 lo pude realizar sin problema



El futuro de Crescendo  
Nosotros como equipo creemos que el proyecto tiene las características necesarias para poder trascender y ser usado en eventos. Ya nos contactamos con varios Dj reconocidos los cuales nos dieron feedback y aportaron una mirada más profesional al proyecto. El día 10/12/2023 tenemos nuestro MVP, un Dj nos llamó para utilizar la plataforma en una fiesta a la que asistirán más de 200 personas lo cual es un logro muy importante para nosotros como desarrolladores. A continuación dejaremos constancia las cosas que nos propusimos a desarrollar en el futuro: 

Aplicación mobile para los Dj
Predecir las probabilidad de que un dj acepte una canción
Insights útiles para el dj sobre el público una vez finalizada la fiesta

