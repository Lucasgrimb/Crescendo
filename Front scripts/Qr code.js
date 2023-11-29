// Variables globales
let party_id; // Declara party_id en un ámbito global

// Función para mostrar las canciones
function displaySongs(songs) {
  const songContainer = document.getElementById('song-container');
  const acceptedContainer = document.querySelector('.song-container-accepted');
  const rejectedContainer = document.querySelector('.song-container-rejected');
  const gapHeight = 20;

  const peticionesHeight = songs.length * 68;

  acceptedContainer.style.top = `${peticionesHeight + gapHeight - 250}px`;
  rejectedContainer.style.top = `${peticionesHeight + gapHeight - 250}px`;

  songContainer.innerHTML = "";
  acceptedContainer.innerHTML = "";
  rejectedContainer.innerHTML = "";

  if (songs.length === 0) {
    const noSongsMessage = document.createElement('div');
    noSongsMessage.className = "no-songs";
    noSongsMessage.innerText = "No hay canciones para mostrar";
    songContainer.appendChild(noSongsMessage);
  } else {
    songs.forEach((song) => {
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

      const rejectButton = document.createElement('button');
      rejectButton.className = "reject-song";
      rejectButton.innerText = "X";

      acceptButton.addEventListener('click', async () => {
        const song_id = songItem.getAttribute('data-song_id');
        if (await updateSongState(song_id, 'accept')) {
          acceptedContainer.appendChild(songItem);
          songItem.classList.add("accepted");
          acceptButton.remove();
          rejectButton.remove();
        } else {
          console.error(`Failed to accept song with ID: ${song_id}`);
        }
      });

      rejectButton.addEventListener('click', async () => {
        const song_id = songItem.getAttribute('data-song_id');
        if (await updateSongState(song_id, 'reject')) {
          rejectedContainer.appendChild(songItem);
          songItem.classList.add("rejected");
          acceptButton.remove();
          rejectButton.remove();
        } else {
          console.error(`Failed to reject song with ID: ${song_id}`);
        }
      });

      songDetails.appendChild(songTitle);
      songDetails.appendChild(songArtist);
      songItem.appendChild(songImage);
      songItem.appendChild(songDetails);
      songItem.appendChild(acceptButton);
      songItem.appendChild(rejectButton);

      if (songItem.getAttribute('data-songstate') === 'accepted') {
        acceptedContainer.appendChild(songItem);
        songItem.classList.add("accepted");
        acceptButton.remove();
        rejectButton.remove();
      } else if (songItem.getAttribute('data-songstate') === 'rejected') {
        rejectedContainer.appendChild(songItem);
        songItem.classList.add("rejected");
        acceptButton.remove();
        rejectButton.remove();
      } else {
        songContainer.appendChild(songItem);
      }
    });
  }
}

// Función para llamar al endpoint /api/token y obtener el accessToken
async function fetchAccessToken() {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
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

    return data.accessToken; // Devuelve el accessToken
  } catch (error) {
    console.error('Hubo un problema con la petición de fetch:', error);
    return null;
  }
}

// Función para obtener las canciones seleccionadas
async function getSelectedSongs(party_id) {
  try {
    const response = await fetch(`https://energetic-gown-elk.cyclic.app/api/selectedsongs/${party_id}`, {
      method: "GET",
      headers: {

      },
    });

    if (!response.ok) {
      throw new Error("No se pudo obtener las canciones seleccionadas");
    }

    const data = await response.json();
    console.log(data);

    displaySongs(data);
  } catch (error) {
    console.error(error);
  }
}

// Función para actualizar el estado de una canción
async function updateSongState(song_id, action) {
  let accessToken = localStorage.getItem('accessToken');

  async function sendUpdateRequest(token) {
    const endpointAction = action === "accept" ? "accept" : "reject";
    const response = await fetch(`https://energetic-gown-elk.cyclic.app/api/B/${song_id}/${party_id}/${endpointAction}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    return response;
  }

  try {
    let response = await sendUpdateRequest(accessToken);

    if (response.status === 403) {
      accessToken = await fetchAccessToken();
      if (!accessToken) {
        throw new Error('No se pudo renovar el token de acceso');
      }
      response = await sendUpdateRequest(accessToken);
    }

    if (!response.ok) {
      throw new Error(`Failed to ${action} the song.`);
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Evento para cargar las funciones principales cuando la página se carga
window.addEventListener("load", () => {
  const qrLink = document.getElementById('qrLink');
  qrLink.href = `Scan.html?party_id=${party_id}`;
  main();
});

// Función principal que inicia las operaciones
async function main() {
  console.log("MAIN");
  const urlParams = new URLSearchParams(window.location.search);
  party_id = urlParams.get('party_id');
  displaySongs([]); // false para no mostrar los botones inicialmente
  await getSelectedSongs(party_id);
}

// Evento para cargar las funciones principales cuando la página se carga
window.addEventListener("load", () => {
  const qrLink = document.getElementById('qrLink');
  qrLink.href = `Scan.html?party_id=${party_id}`;
  main();
});
