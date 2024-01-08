// Función para solicitar un token de Spotify
function requestSpotifyToken() {
    // Credenciales del cliente
    const clientId = '4ba679a5493041059789f92a2c776588';
    const clientSecret = 'f03ee7bb97574f5fa9b1dab44d615c97';

    const tokenEndpoint = 'https://accounts.spotify.com/api/token';
    const data = 'grant_type=client_credentials';
    const base64Credentials = btoa(clientId + ':' + clientSecret);

    // Realiza la solicitud para obtener el token
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

// Función para buscar una pista en Spotify
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

// Función para mostrar los resultados de la búsqueda
function displayResults(tracks) {
    if (!tracks || tracks.length === 0) {
        console.log('No tracks received.');
        return;
    }

    const resultsDiv = document.getElementById('resultsDropdown');
    resultsDiv.innerHTML = '';

    tracks.forEach((track) => {
        if (!track || !track.album || !track.album.images || track.album.images.length === 0) {
            console.log('Missing data for this track', track);
            return;
        }

        const image = track.album.images[0].url;
        const title = track.name;
        const artist = track.artists[0].name;
        const trackId = track.id;

        const resultDiv = document.createElement('div');
        resultDiv.classList.add('result');
        resultDiv.setAttribute('data-track-id', trackId);

        const imageElement = document.createElement('img');
        imageElement.src = image;
        imageElement.alt = title;

        const textContainer = document.createElement('div');
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
        resultDiv.appendChild(textContainer);

        resultsDiv.appendChild(resultDiv);
    });

    resultsDiv.style.display = 'block';
}


// Actualiza los detalles de la canción en el modal
function updateSongDetails(image, title, artist, trackId) {
    const modal = document.querySelector('.modal');
    modal.querySelector('#song-image').src = image;
    modal.querySelector('h2').textContent = title;
    modal.querySelector('p').textContent = artist;
    modal.setAttribute('data-id', trackId);
    modal.style.display = 'flex';
}


function isSongAlreadyRequested(party_id, trackId) {
    const requestedSongs = JSON.parse(localStorage.getItem('requestedSongs')) || [];
    return requestedSongs.includes(party_id + '-' + trackId);
}




// Manejador para el botón Aceptar
async function handleAcceptClick() {
    const acceptButton = document.getElementById('acceptButton');
    acceptButton.disabled = true;

    const trackId = document.querySelector('.modal').dataset.id;
    const party_id = new URL(window.location.href).searchParams.get('party_id');

    
    // Verificar si la canción ya fue solicitada
    if (isSongAlreadyRequested(party_id, trackId)) {
        alert("Ya has solicitado esta canción, elige otra por favor!");
        return;
    }

    saveToLocalStorage(party_id, trackId); // Actualizar el localStorage

    const data = {
        party_id,
        song_id: trackId
    };

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    };



    try {
        await sendRequestWithRetry('https://energetic-gown-elk.cyclic.app/api/store-song-request', requestOptions, 3);
        alert('¡Gracias por tu solicitud!');
        location.reload();
    } catch (error) {
        console.error('Error:', error);
        alert('¡Ups! Parece que hubo un error al mandar la solicitud');
        acceptButton.disabled = false;
    }
}

function saveToLocalStorage(party_id, trackId) {
    const requestedSongs = JSON.parse(localStorage.getItem('requestedSongs')) || [];
    requestedSongs.push(party_id + '-' + trackId);
    localStorage.setItem('requestedSongs', JSON.stringify(requestedSongs));
}




async function sendRequestWithRetry(url, options, retries) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error('La petición no fue exitosa');
            return await response.json(); // Devuelve la respuesta en caso de éxito
        } catch (error) {
            console.error(`Intento ${i + 1} fallido:`, error);
            if (i === retries - 1) throw error; // Lanza el error después del último intento
        }
    }
}


// Función para guardar datos en localStorage
function saveToLocalStorage(party_id, trackId) {
    // Obtenemos cualquier dato existente para ese party_id
    const existingData = JSON.parse(localStorage.getItem(party_id)) || [];
    
    // Añadimos el nuevo trackId
    existingData.push(trackId);
    
    // Guardamos la nueva lista en localStorage
    localStorage.setItem(party_id, JSON.stringify(existingData));
}




// Código que se ejecuta cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const party_id = urlParams.get('party_id');

    
    // Manejador para el botón Aceptar
    document.getElementById('acceptButton').addEventListener('click', handleAcceptClick);
    // Manejador para el botón de búsqueda
    document.querySelector('.searchbtn').addEventListener('click', (e) => {
        e.preventDefault();
        performSearch();
    });
    // Manejador para el campo de búsqueda
    document.querySelector('#search').addEventListener('input', () => {
        performSearch();
    });
    // Manejador para recargar la página cuando se presiona la "x"
    document.querySelector('.cruz.spaced').addEventListener('click', function(event) {
        event.preventDefault();
        location.reload();
    });

    // Función para realizar una búsqueda
    function performSearch() {
        const query = document.getElementById('search').value;
        if (!query) {
            document.getElementById('resultsDropdown').style.display = 'none';
            return;
        }

        requestSpotifyToken()
            .then(token => searchTrack(query, token))
            .then(tracks => displayResults(tracks))
            .catch(error => console.error('Error:', error.message));
    }

    // Esconder resultados si se hace clic fuera de ellos
    window.addEventListener('click', function(event) {
        const resultsDiv = document.getElementById('resultsDropdown');
        if (!resultsDiv.contains(event.target)) {
            resultsDiv.style.display = 'none';
        }
    });

    // Actualizar los detalles de la canción al hacer clic en un resultado
    document.getElementById('resultsDropdown').addEventListener('click', (event) => {
        const clickedElement = event.target.closest('.result');
        if (clickedElement) {
            const image = clickedElement.querySelector('img').src;
            const title = clickedElement.querySelector('.song-title').textContent;
            const artist = clickedElement.querySelector('.song-artist').textContent;
            const trackId = clickedElement.getAttribute('data-track-id');

            updateSongDetails(image, title, artist, trackId);
        }
    });
        // Manejador para el botón "Ir a otra página"
        document.getElementById('ShowRequestedSongs').addEventListener('click', function() {
            const party_id = new URL(window.location.href).searchParams.get('party_id');
    
            // Redirigir a la otra página con el parámetro en la URL
            window.location.href = 'requestedSongs.html?party_id=' + party_id;
        });
});

