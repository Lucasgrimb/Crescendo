const urlParams = new URLSearchParams(window.location.search);
const party_id = urlParams.get('party_id');
console.log(party_id);

// Función para obtener el token de acceso
async function fetchAccessToken() {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No se encontró refreshToken en localStorage');
        }

        const response = await fetch('https://energetic-gown-elk.cyclic.app/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });

        if (!response.ok) {
            throw new Error('La petición de token no fue exitosa');
        }

        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        return data.accessToken;
    } catch (error) {
        console.error('Hubo un problema con la petición de fetch:', error);
        alert('Error al obtener el token de acceso. Por favor, intente nuevamente.');
        return null;
    }
}

// Función para obtener las canciones aceptadas
async function getSelectedSongs(party_id) {
    try {
        let accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            accessToken = await fetchAccessToken();
        }

        const response = await fetch(`https://energetic-gown-elk.cyclic.app/api/selectedsongs/${party_id}`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error("No se pudo obtener las canciones seleccionadas");
        }

        const songs = await response.json();
        const acceptedSongs = songs.filter(song => song.song_state === 'accepted');
        console.log(acceptedSongs);
        displaySongs(acceptedSongs);
    } catch (error) {
        console.error(error);
        alert('Error al obtener las canciones aceptadas. Por favor, intente nuevamente.');
    }
}

// Función para mostrar las canciones aceptadas
function displaySongs(songs) {
    const acceptedContainer = document.getElementById('song-container-accepted');
    acceptedContainer.innerHTML = ""; // Limpiamos el contenedor antes de agregar los elementos nuevos

    songs.forEach(song => {
        const songElement = document.createElement('div');
        songElement.className = 'song-item';
        songElement.innerHTML = `
            <div class="song-image"><img src="${song.image_url}" alt="${song.name}"></div>
            <div class="song-details">
                <p class="song-title">${song.name}</p>
                <p class="song-artist">${song.artist}</p>
            </div>
        `;
        acceptedContainer.appendChild(songElement);
    });
}

// Inicializar la obtención de canciones aceptadas
document.addEventListener('DOMContentLoaded', () => getSelectedSongs(party_id));
