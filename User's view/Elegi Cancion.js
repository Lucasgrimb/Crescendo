/* falta que: 
- Arreglar el css para que no quede horrible
- buscar forma de guardar el id de la cancion al precionarla. te dejo una pista: "resultDiv.setAttribute("data-id", trackId); "
-  Cuando uno toca una cancion aparece el confirmar cancion. 
*/

// Función para obtener el token de acceso de Spotify
function requestSpotifyToken() {
    // Configura tus credenciales de la aplicación Spotify
    const clientId = '4ba679a5493041059789f92a2c776588'; 
    const clientSecret = 'f03ee7bb97574f5fa9b1dab44d615c97'; 

    // Endpoint de Spotify para obtener el token
    const tokenEndpoint = 'https://accounts.spotify.com/api/token';
    const data = 'grant_type=client_credentials';

    // Codifica tus credenciales en Base64
    const base64Credentials = btoa(clientId + ':' + clientSecret);

    // Hace una petición a Spotify para obtener el token
    return fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + base64Credentials
        },
        body: data
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error_description);
        }
        return data.access_token;
    });
}

// Función para buscar canciones en Spotify con un token dado
function searchTrack(query, token) {
    // Hace una petición a Spotify para buscar canciones basadas en la query
    return fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error.message);
        }
        return data.tracks.items;
    });
}

// Función para mostrar los resultados de búsqueda en el DOM
function displayResults(tracks) {
    // Obtiene el contenedor de resultados del DOM
    const resultsDiv = document.getElementById('resultsDropdown'); 
    resultsDiv.innerHTML = '';

    // Para cada pista obtenida, crea elementos del DOM para mostrarla
    tracks.forEach((track) => {
        const image = track.album.images[0].url;
        const title = track.name;
        const artist = track.artists[0].name;
        const trackId = track.id;

        const resultDiv = document.createElement('div');
        resultDiv.classList.add('result');

        const imageElement = document.createElement('img');
        imageElement.src = image;
        imageElement.alt = title;

        const textContainer = document.createElement('div'); // Nuevo contenedor
        textContainer.classList.add('text-container');

        const titleElement = document.createElement('p');
        titleElement.textContent = title;
        titleElement.classList.add('song-title'); 

        const artistElement = document.createElement('p');
        artistElement.textContent = artist;
        artistElement.classList.add('song-artist');

        textContainer.appendChild(titleElement);
        textContainer.appendChild(artistElement);

        resultDiv.appendChild(imageElement);
        resultDiv.appendChild(textContainer); // Agregar el nuevo contenedor
        resultsDiv.appendChild(resultDiv);
        resultsDiv.style.display = 'block';  // Muestra el contenedor de resultados
    });
}

document.addEventListener('DOMContentLoaded', function() {

    // Manejador de evento para el botón de búsqueda
    document.querySelector('.searchbtn').addEventListener('click', (e) => {
        e.preventDefault();
        performSearch();
    });

    // Manejador de evento para el campo de búsqueda
    document.querySelector('#search').addEventListener('input', (e) => {
        performSearch();
    });

    function performSearch() {
        const query = document.getElementById('search').value;
        if (!query) {
            document.getElementById('resultsDropdown').style.display = 'none';
            return;
        }

        requestSpotifyToken()
            .then(token => {
                return searchTrack(query, token);
            })
            .then(tracks => {
                displayResults(tracks);
            })
            .catch(error => {
                console.error('Error:', error.message);
            });
    }

    // Función para ocultar los resultados cuando se hace clic fuera del área
    window.addEventListener('click', function(event) {
        const resultsDiv = document.getElementById('resultsDropdown');
        if (!resultsDiv.contains(event.target)) {
            resultsDiv.style.display = 'none';
        }
    });
 // guardamos el id de la cancion seleccionada con la siguiente funcion:
 const resultDiv = document.querySelector("#resultDiv");
resultDiv.setAttribute("data-id", trackId);
});
// prueba gpt
// esconder elegir cancion funciones
// document.getElementsByClassName("modal").style.display = "none";
// elegir cancion aparece
// document.getElementsByClassName("modal").style.display = "initial";
document.addEventListener('DOMContentLoaded', function() {
    // ... Tu código existente ...

    // Manejador de evento para hacer clic en una canción en los resultados
    const resultsDiv = document.getElementById('resultsDropdown');
    resultsDiv.addEventListener('click', (event) => {
        const clickedElement = event.target.closest('.result');
        if (clickedElement) {
            const modal = document.querySelector('.modal');
            const songImage = modal.querySelector('#song-image');
            const songTitle = modal.querySelector('h2');
            const songArtist = modal.querySelector('p');
            const songAlbum = modal.querySelector('.album'); // Selecciona el elemento con la clase "album"

            // Obtener los datos de la canción seleccionada
            const image = clickedElement.querySelector('img').src;
            const title = clickedElement.querySelector('.song-title').textContent;
            const artistAlbum = clickedElement.querySelector('.song-artist').textContent;

            // Separa el nombre del artista y el álbum
            const [artist, album] = artistAlbum.split(' - ');

            // Actualizar los elementos en la pantalla modal
            songImage.src = image;
            songTitle.textContent = title;
            songArtist.textContent = artist;
            songAlbum.textContent = album; // Actualiza el nombre del álbum

            // Mostrar la pantalla modal
            modal.style.display = 'flex';

            // Guardar el ID de la canción seleccionada en el atributo data-id
            const resultDiv = document.getElementById('resultDiv');
            resultDiv.setAttribute('data-id', clickedElement.dataset.trackId);
        }
    });

});

document.getElementById('botonAceptar').addEventListener('click', () => {
    const seleccion = document.getElementById('canciones');
    const tokenDeCancion = seleccion.value; // Obtenemos el valor del token de la canción seleccionada
  
    // URL de tu API donde enviarás los datos
    const url = 'https://api/store-song-request';
  
    // Objeto con la información que enviarás a la API
    const data = {
      token: tokenDeCancion
    };
  
    // Configuración de la solicitud fetch
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Especificamos el tipo de contenido JSON
      },
      body: JSON.stringify(data) // Convertimos el objeto a JSON
    };
  
    // Realizamos la solicitud fetch
    fetch(url, requestOptions)
      .then(response => response.json()) // Manejamos la respuesta como JSON si la API devuelve datos
      .then(result => {
        console.log('Respuesta de la API:', result);
        // Puedes agregar aquí más lógica para manejar la respuesta de la API
      })
      .catch(error => {
        console.error('Error al realizar la solicitud:', error);
        // Manejo de errores, si es necesario
      });
  });
  