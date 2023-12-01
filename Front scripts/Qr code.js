// Obtener el party_id de la URL
const urlParams = new URLSearchParams(window.location.search);
const party_id = urlParams.get('party_id');
console.log(party_id);

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
      headers: {}
    });

    if (!response.ok) {
      throw new Error("No se pudo obtener las canciones seleccionadas");
    }

    const data = await response.json();
    console.log(data);

    // Haz algo con los datos, como mostrar las canciones
    displaySongs(data);

    // Ajusta las posiciones después de mostrar las canciones
    ajustarPosiciones();
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

    // Si el token es inválido o expiró, intenta obtener uno nuevo
    if (response.status === 403) {
      accessToken = await fetchAccessToken();
      if (!accessToken) {
        throw new Error('No se pudo renovar el token de acceso');
      }
      response = await sendUpdateRequest(accessToken);
    }

    // Manejar respuestas no exitosas después de la renovación del token
    if (!response.ok) {
      throw new Error(`Failed to ${action} the song.`);
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Función para mostrar las canciones
function displaySongs(songs) {
  const songContainer = document.getElementById('song-container');
  const acceptedContainer = document.querySelector('.song-container-accepted');
  const rejectedContainer = document.querySelector('.song-container-rejected');

  // Calcula la altura total de las canciones en peticiones
  const peticionesHeight = Array.from(songContainer.children).reduce((totalHeight, songItem) => {
    return totalHeight + songItem.clientHeight;
  }, 0);

  // Ajusta la posición de las secciones de canciones aceptadas y rechazadas
  acceptedContainer.style.top = `${peticionesHeight + 1 + 45}px`; // 45 píxeles de distancia
  rejectedContainer.style.top = `${peticionesHeight + 1 + 45 * 2}px`; // 45 píxeles desde la sección aceptada
  songContainer.innerHTML = "";
  acceptedContainer.innerHTML = ""; // Clear the accepted songs container
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

      // Agregar los manejadores de eventos aquí
      acceptButton.addEventListener('click', async () => {
        const song_id = songItem.getAttribute('data-song_id');
        if (await updateSongState(song_id, 'accept')) {
          // Mueve la canción al final de la lista de canciones aceptadas
          acceptedContainer.appendChild(songItem);
          songItem.classList.add("accepted");
          acceptButton.remove();
          rejectButton.remove();
          // Ajusta las posiciones después de aceptar la canción
          ajustarPosiciones();
        } else {
          console.error(`Failed to accept song with ID: ${song_id}`);
        }
      });

      rejectButton.addEventListener('click', async () => {
        const song_id = songItem.getAttribute('data-song_id');
        if (await updateSongState(song_id, 'reject')) {
          // Mueve la canción al final de la lista de canciones rechazadas
          rejectedContainer.appendChild(songItem);
          songItem.classList.add("rejected");
          acceptButton.remove();
          rejectButton.remove();
          // Ajusta las posiciones después de rechazar la canción
          ajustarPosiciones();
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

      // Decide dónde añadir el songItem en función de su estado
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

// Función para ajustar las posiciones de las secciones y los elementos .accept-peticion y .reject-peticion
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
  const espacioEntreSecciones = 20; // Nuevo: Espacio entre secciones aceptadas y rechazadas

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



// Llama a esta función al inicio para ajustar las posiciones iniciales
ajustarPosiciones();

// Función para actualizar el estilo de la última canción aceptada
function actualizarUltimaCancion() {
  const songContainer = document.getElementById('song-container');
  const containerHeight = songContainer.clientHeight;
  const scrollHeight = songContainer.scrollHeight;
  const scrollPosition = songContainer.scrollTop;

  if (containerHeight + scrollPosition >= scrollHeight) {
    // Aplica el estilo especial a la última canción
    const lastSong = document.querySelector('.song-item.accepted:last-child');
    if (lastSong) {
      lastSong.classList.add('special-last-song');
    }
  } else {
    // Elimina el estilo especial si no estamos en la última canción
    const specialLastSong = document.querySelector('.song-item.accepted.special-last-song');
    if (specialLastSong) {
      specialLastSong.classList.remove('special-last-song');
    }
  }
}


// Función principal que inicia las operaciones
async function main() {
  console.log("MAIN");

  displaySongs([]); // false para no mostrar los botones inicialmente
  await getSelectedSongs(party_id);
}

// Evento para cargar las funciones principales cuando la página se carga
window.addEventListener("load", () => {
  const qrLink = document.getElementById('qrLink');
  qrLink.href = `Scan.html?party_id=${party_id}`;
  main();
});

// Evento para actualizar el estilo de la última canción aceptada al hacer scroll
const songContainer = document.getElementById('song-container');
songContainer.addEventListener('scroll', actualizarUltimaCancion);