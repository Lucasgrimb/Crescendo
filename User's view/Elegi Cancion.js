
/* falta que: 
- cambies el html y css para que no quede horrible
- buscar forma de guardar el id de la cancion al precionarla. te dejo una pista: "resultDiv.setAttribute("data-id", trackId); "
- El confirmar/cancelar oferta tiene que ser en la misma pagina. 
- Deja todo oculto y cunado uno toca una cancion aparece. 
*/


// Función para obtener el token de acceso de Spotify
function requestSpotifyToken() {
    // ... (código previo)
}

// Función para buscar canciones en Spotify con un token dado
function searchTrack(query, token) {
    // ... (código previo)
}

// Función para mostrar los resultados de búsqueda en el DOM
function displayResults(tracks) {
    const resultsDiv = document.getElementById('resultsDropdown'); 
    resultsDiv.innerHTML = '';

    tracks.forEach((track) => {
        // ... (código previo)

        const resultDiv = document.createElement('div');
        resultDiv.classList.add('result', 'song-result'); // Agrega clases aquí

        // ... (código previo)

        resultsDiv.appendChild(resultDiv);
        resultsDiv.style.display = 'block';  // Muestra el contenedor de resultados
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // ... (código previo)

    function performSearch() {
        // ... (código previo)
    }

    // Manejador de evento para hacer clic en un resultado de canción
    document.getElementById('resultsDropdown').addEventListener('click', (e) => {
        if (e.target.classList.contains('song-result')) {
            // Acción que se ejecutará al hacer clic en una canción
            // Por ejemplo, mostrar los nuevos botones y ocultar el resto de la página
            // ... (agrega tu lógica aquí)
        }
    });
});

