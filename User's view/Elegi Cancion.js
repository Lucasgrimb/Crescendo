// Función para obtener el token de acceso de Spotify
function requestSpotifyToken() {
    const clientId = '4ba679a5493041059789f92a2c776588'; // Reemplazar con tu client_id
    const clientSecret = 'f03ee7bb97574f5fa9b1dab44d615c97'; // Reemplazar con tu client_secret (No seguro para producción)

    const tokenEndpoint = 'https://accounts.spotify.com/api/token';
    const data = 'grant_type=client_credentials';

    const base64Credentials = btoa(clientId + ':' + clientSecret);

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
    const resultsDiv = document.getElementById('resultsDropdown'); // Asegúrate de tener un elemento con este ID en tu HTML
    resultsDiv.innerHTML = '';
 

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


        resultDiv.appendChild(imageElement);
        resultDiv.appendChild(titleElement);
        resultDiv.appendChild(artistElement);


        resultsDiv.appendChild(resultDiv);
        resultDiv.addEventListener('click', function() {
            console.log("Track ID: ", trackId);  // Esto imprimirá el ID de la canción en consola
        });
        resultsDiv.appendChild(resultDiv);
    });
    
    resultsDiv.style.display = 'block';  // Añade esta línea

}


// Manejador de evento para el botón de búsqueda
document.querySelector('.searchbtn').addEventListener('click', (e) => {
    e.preventDefault(); // Evita que el formulario se envíe y recargue la página

    const query = document.getElementById('search').value;
    if (!query) return; // Si no hay texto para buscar, salir

    requestSpotifyToken().then(token => {
        return searchTrack(query, token);
    }).then(tracks => {
        displayResults(tracks);
    }).catch(error => {
        console.error('Error:', error.message);
    });
});
