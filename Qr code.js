// Obtener el party_id de la URL
const urlParams = new URLSearchParams(window.location.search);
const party_id = urlParams.get('party_id');

// Función para llamar al endpoint /api/token y obtener el accessToken
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

    return data.accessToken; // Devuelve el accessToken
  } catch (error) {
    console.error('Hubo un problema con la petición de fetch:', error);
    return null;
  }
}

// Función para obtener las canciones seleccionadas
async function getSelectedSongs() {
  try {
    const accessToken = await fetchAccessToken();
    const response = await fetch(`https://crescendoapi-pro.vercel.app/api/selectedsongs/${party_id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      }
    });

    if (!response.ok) {
      throw new Error("No se pudo obtener las canciones seleccionadas");
    }

    const data = await response.json();
    displaySongs(data.songs);
  } catch (error) {
    console.error(error);
  }
}

// Función para actualizar el estado de una canción
async function updateSongState(songId, action) {
  try {
    const accessToken = await fetchAccessToken();
    const response = await fetch(`https://crescendoapi-pro.vercel.app/api/songs/${songId}/${party_id}/${action}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
    });

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
      songItem.setAttribute('data-songid', song.id);
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
      songArtist.innerText = song.artist;

      const acceptButton = document.createElement('button');
      acceptButton.className = "accept-song";
      acceptButton.innerText = "✓";
      acceptButton.addEventListener('click', async () => {
        // Implementación del botón de aceptar
      });

      const rejectButton = document.createElement('button');
      rejectButton.className = "reject-song";
      rejectButton.innerText = "X";
      rejectButton.addEventListener('click', async () => {
        // Implementación del botón de rechazar
      });

      songDetails.appendChild(songTitle);
      songDetails.appendChild(songArtist);
      songItem.appendChild(songImage);
      songItem.appendChild(songDetails);
      songItem.appendChild(acceptButton);
      songItem.appendChild(rejectButton);

      // Decide dónde añadir el songItem en función de su estado
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

// Función para generar y mostrar el código QR
async function generateQRCode() {
    const url = `https://crescendo-nine.vercel.app/Elegi%20Cancion.html?party_id=${party_id}`;
    const qr = await QRCode.toDataURL(url);
    const qrContainer = document.getElementById('qr-container');
    qrContainer.src = qr;
}

// Función principal que inicia las operaciones
async function main() {
    console.log("MAIN");
    const accessToken = await fetchAccessToken();
    if (accessToken) {
        displaySongs([]);
        await getSelectedSongs();
    }
}

// Función para actualizar pedidos de canciones
function actualizarPedidos() {
    $.ajax({
        url: `https://crescendoapi-pro.vercel.app/api/selectedsongs/${party_id}`,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            $('#song-container').html(data.pedidos);
        },
        error: function (error) {
            console.error('Error loading song requests: ' + error);
        }
    });
}

var intervalo = setInterval(actualizarPedidos, 5000);

// Evento para cargar las funciones principales cuando la página se carga
window.addEventListener("load", () => {
    main();
    generateQRCode();
});
