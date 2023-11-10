document.addEventListener('DOMContentLoaded', async () => {
    const accessToken = await fetchAccessToken();
    if (accessToken) {
        await loadPartiesList();
        document.getElementById('createPartyButton').addEventListener('click', createParty);
    } else {
        console.error('No se pudo obtener el token de acceso.');
        // Manejar la situación en la que no se puede obtener un token (mostrar mensaje, redirigir, etc.)
    }
});

async function fetchAccessToken() {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await fetch('https://crescendoapi-pro.vercel.app/api/token', {
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
        return null;
    }
}

async function fetchWithTokenRefresh(url, options) {
    let response = await fetch(url, options);
    if (response.status === 401) {
        const newAccessToken = await fetchAccessToken();
        if (!newAccessToken) {
            throw new Error('No se pudo obtener un nuevo token de acceso');
        }
        options.headers['Authorization'] = `Bearer ${newAccessToken}`;
        response = await fetch(url, options);
    }
    return response;
}

async function loadPartiesList() {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetchWithTokenRefresh('https://crescendoapi-pro.vercel.app/api/partyhistory', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const data = await response.json();
    const partiesList = document.getElementById('partiesList');
    partiesList.innerHTML = '';
    if (data.parties && data.parties.length > 0) {
        data.parties.forEach(party => {
            const partyElement = document.createElement('div');
            partyElement.innerText = party.party_name;
            partyElement.classList.add('party');
            partyElement.addEventListener('click', () => showPartySongs(party.party_id));
            partiesList.appendChild(partyElement);
        });
    } else {
        partiesList.innerHTML = '<p>Todavía no tienes fiestas. ¡Crea una!</p>';
    }
}

async function createParty() {
    const partyName = prompt('Ingrese el nombre de la fiesta:');
    if (!partyName) return;
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetchWithTokenRefresh('https://crescendoapi-pro.vercel.app/api/createParty', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ partyName })
    });

    const data = await response.json();
    if (data.success) {
        window.location.href = `/Qr%20code?partyId=${data.party_id}`;
    } else {
        alert('No se pudo crear la fiesta. Intente nuevamente.');
    }
}

async function showPartySongs(partyId) {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetchWithTokenRefresh(`https://crescendoapi-pro.vercel.app/api/partyhistory/${partyId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const data = await response.json();
    if (data.success) {
        displaySongs(data.parties.find(party => party.party_id === partyId).songs);
    } else {
        alert('No se pudieron cargar las canciones. Intente nuevamente.');
    }
}

function displaySongs(songs) {
    // Asumiendo que existen estos contenedores en tu HTML
    const songContainer = document.getElementById('song-container');
    const acceptedContainer = document.querySelector('.song-container-accepted');
    const rejectedContainer = document.querySelector('.song-container-rejected');

    songContainer.innerHTML = '';
    acceptedContainer.innerHTML = '';
    rejectedContainer.innerHTML = '';

    if (songs.length === 0) {
        const noSongsMessage = document.createElement('div');
        noSongsMessage.className = "no-songs";
        noSongsMessage.innerText = "No hay canciones para mostrar";
        songContainer.appendChild(noSongsMessage);
    } else {
        songs.forEach((song) => {
            const songItem = document.createElement('div');
            songItem.className = "song-item";
            songItem.setAttribute('data-songid', song.id);
            songItem.setAttribute('data-songstate', song.song_state);

            const songImage = document.createElement('div');
            songImage.className = "song-image";
            const imgElement = document.createElement("img");
            imgElement.src = song.image; // Asumiendo que la canción tiene una propiedad 'image'
            songImage.appendChild(imgElement);

            const songDetails = document.createElement('div');
            songDetails.className = "song-details";
            const songTitle = document.createElement('p');
            songTitle.className = "song-title";
            songTitle.innerText = song.name; // Asumiendo que la canción tiene una propiedad 'name'
            const songArtist = document.createElement('p');
            songArtist.className = "song-artist";
            songArtist.innerText = song.artist; // Asumiendo que la canción tiene una propiedad 'artist'

            songDetails.appendChild(songTitle);
            songDetails.appendChild(songArtist);
            songItem.appendChild(songImage);
            songItem.appendChild(songDetails);

            if (song.song_state === 'accepted') {
                acceptedContainer.appendChild(songItem);
            } else if (song.song_state === 'rejected') {
                rejectedContainer.appendChild(songItem);
            } else {
                songContainer.appendChild(songItem);
            }
        });
    }
}
