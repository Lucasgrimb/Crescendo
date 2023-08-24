/* falta que: 
- cambies el html y css para que no quede horrible
- buscar forma de guardar el id de la cancion al precionarla. te dejo una pista: "resultDiv.setAttribute("data-id", trackId); "
- El confirmar/cancelar oferta tiene que ser en la misma pagina. 
- Deja todo oculto y cunado uno toca una cancion aparece. 
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

        const titleElement = document.createElement('p');
        titleElement.textContent = title;

        const artistElement = document.createElement('p');
        artistElement.textContent = artist;

        const trackIdElement = document.createElement('p');
        trackIdElement.textContent = "ID: " + trackId;
        trackIdElement.classList.add('track-id');

        resultDiv.appendChild(imageElement);
        resultDiv.appendChild(titleElement);
        resultDiv.appendChild(artistElement);

        
        //se muestran los id de las canciones por orden. 
        console.log(trackId);
       // resultDiv.appendChild(trackIdElement);

        resultsDiv.appendChild(resultDiv);
        resultsDiv.style.display = 'block';  // Muestra el contenedor de resultados
    });
}

// Manejador de evento para el botón de búsqueda
document.querySelector('.searchbtn').addEventListener('click'), (e) => {
    e.preventDefault()}; // Evita que el formulario se envíe y recargue la página

    // Obtiene el valor de la búsqueda del input
    const query = document.getElementById('search').value;
    if (!query) return; // Si no hay texto para buscar, salir

    // Primero solicita el token, luego realiza la búsqueda y finalmente muestra los resultados
    requestSpotifyToken().then(token => {
        return searchTrack(query, token);
    }).then(tracks => {
        displayResults(tracks);
    }).catch(error) => {
        console.error('Error:', error.message)};
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


});
