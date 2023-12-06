// Obtener el party_id de la URL
const urlParams = new URLSearchParams(window.location.search);
const party_id = urlParams.get('party_id');
console.log(party_id);

// Función para llamar al endpoint /api/token y obtener el accessToken
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

// Función para obtener las canciones seleccionadas
async function getSelectedSongs(party_id) {
    try {
        const response = await fetch(`https://energetic-gown-elk.cyclic.app/api/selectedsongs/${party_id}`, {
            method: "GET",
            headers: {}
        });

        if (!response.ok) {
            throw new Error("No se pudo obtener las canciones seleccionadas");
        }

        const data = await response.json();
        console.log(data);
        displaySongs(data);
        ajustarPosiciones();
    } catch (error) {
        console.error(error);
        alert('Error al obtener las canciones seleccionadas. Por favor, intente nuevamente.');
    }
}

// Función para actualizar el estado de una canción
async function updateSongState(song_id, action) {
    let accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        accessToken = await fetchAccessToken();
        if (!accessToken) {
            return false;
        }
    }

    try {
        const endpointAction = action === "accept" ? "accept" : "reject";
        const response = await fetch(`https://energetic-gown-elk.cyclic.app/api/B/${song_id}/${party_id}/${endpointAction}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
        });

        if (response.status === 403) {
            accessToken = await fetchAccessToken();
            if (!accessToken) {
                throw new Error('No se pudo renovar el token de acceso');
            }
            return updateSongState(song_id, action);
        }

        if (!response.ok) {
            throw new Error(`Failed to ${action} the song.`);
        }

        return true;
    } catch (error) {
        console.error(error);
        alert(`Error al ${action === "accept" ? "aceptar" : "rechazar"} la canción. Por favor, intente nuevamente.`);
        return false;
    }
}

// Función para mostrar las canciones
function displaySongs(songs) {
    const songContainer = document.getElementById('song-container');
    const acceptedContainer = document.querySelector('.song-container-accepted');
    const rejectedContainer = document.querySelector('.song-container-rejected');

    songContainer.innerHTML = "";
    acceptedContainer.innerHTML = "";
    rejectedContainer.innerHTML = "";

    if (songs.length === 0) {
        const noSongsMessage = document.createElement('div');
        noSongsMessage.className = "no-songs";
        noSongsMessage.innerText = "Cargando canciones pedidas...";
        songContainer.appendChild(noSongsMessage);
        return;
    }

    songs.forEach(song => {
        const songItem = createSongItem(song);
        if (song.song_state === 'accepted') {
            acceptedContainer.appendChild(songItem);
        } else if (song.song_state === 'rejected') {
            rejectedContainer.appendChild(songItem);
        } else {
            songContainer.appendChild(songItem);
        }
    });

    ajustarPosiciones();
}

// Crear un elemento de canción individual
function createSongItem(song) {
    const songItem = document.createElement('div');
    songItem.className = "song-item";
    songItem.setAttribute('data-song_id', song.id);
    songItem.setAttribute('data-songstate', song.song_state);

    const songImage = document.createElement('div');
    songImage.className = "song-image";
    const imgElement = document.createElement("img");
    imgElement.src = song.image;
    songImage.appendChild(imgElement);

    const songDetails = document.createElement('div');
    songDetails.className = "song-details";
    const songTitle = document.createElement('p');
    songTitle.className = "song-title";
    songTitle.innerText = song.name;
    const songArtist = document.createElement('p');
    songArtist.className = "song-artist";
    songArtist.innerText = song.artist.name;

    const acceptButton = document.createElement('button');
    acceptButton.className = "accept-song";
    acceptButton.innerText = "✓";
    acceptButton.addEventListener('click', () => handleSongAction(song.id, 'accept'));

    const rejectButton = document.createElement('button');
    rejectButton.className = "reject-song";
    rejectButton.innerText = "X";
    rejectButton.addEventListener('click', () => handleSongAction(song.id, 'reject'));

    songDetails.appendChild(songTitle);
    songDetails.appendChild(songArtist);
    songItem.appendChild(songImage);
    songItem.appendChild(songDetails);
    songItem.appendChild(acceptButton);
    songItem.appendChild(rejectButton);

    return songItem;
}

// Manejar acción de canción (aceptar/rechazar)
async function handleSongAction(song_id, action) {
    if (await updateSongState(song_id, action)) {
        const songItem = document.querySelector(`[data-song_id="${song_id}"]`);
        if (action === 'accept') {
            document.querySelector('.song-container-accepted').appendChild(songItem);
            songItem.classList.add("accepted");
        } else {
            document.querySelector('.song-container-rejected').appendChild(songItem);
            songItem.classList.add("rejected");
        }
        songItem.querySelector('.accept-song').remove();
        songItem.querySelector('.reject-song').remove();
        ajustarPosiciones();
    }
}

// Función para ajustar las posiciones de las secciones y los elementos
function ajustarPosiciones() {
  const songContainer = document.getElementById('song-container');
  const acceptPeticion = document.querySelector('.accept-peticion');
  const rejectPeticion = document.querySelector('.reject-peticion');

  // Calcula la altura total de las canciones en peticiones
  const peticionesHeight = Array.from(songContainer.children).reduce((totalHeight, songItem) => {
    return totalHeight + songItem.clientHeight;
  }, 0);

  // Define la altura adicional en píxeles debajo de la última canción
  const alturaAdicional = 70; // Ajusta este valor según sea necesario
  const espacioEntreSecciones = 30; // Nuevo: Espacio entre secciones aceptadas y rechazadas

  // Ajusta la posición de los elementos .accept-peticion y .reject-peticion
  if (peticionesHeight === 0) {
    // Caso sin peticiones, ajusta a alturas específicas
    acceptPeticion.style.top = "100px";  // Altura específica para aceptadas
    rejectPeticion.style.top = "300px";  // Altura específica para rechazadas
  } else {
    // Caso normal con peticiones, ajusta en función de la altura total y el espacio entre secciones
    acceptPeticion.style.top = `${peticionesHeight + alturaAdicional * 1.3}px`;
    rejectPeticion.style.top = `${peticionesHeight + alturaAdicional * 3.3 + espacioEntreSecciones}px`;
  }
}

// Función para actualizar el estilo de la última canción aceptada
function actualizarUltimaCancion() {
    const songContainer = document.getElementById('song-container');
    const lastSong = songContainer.querySelector('.song-item:last-child');
    
    if (lastSong) {
        lastSong.classList.toggle('special-last-song', songContainer.scrollHeight - songContainer.scrollTop === songContainer.clientHeight);
    }
}

// Función principal que inicia las operaciones
async function main() {
    document.getElementById('loadingSpinner').style.display = 'block';
    await getSelectedSongs(party_id);
    document.getElementById('loadingSpinner').style.display = 'none';
}

window.addEventListener("load", () => {
    const qrLink = document.getElementById('qrLink');
    qrLink.href = `Scan.html?party_id=${party_id}`;
    main();
});

const songContainer = document.getElementById('song-container');
songContainer.addEventListener('scroll', actualizarUltimaCancion);
