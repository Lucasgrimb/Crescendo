// Obtener el party_id de la URL
const urlParams = new URLSearchParams(window.location.search);
const party_id = urlParams.get('party_id');
console.log(party_id);



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

    const songs = await response.json(); // Directamente un array de canciones
    displaySongs(songs); // Pasa este array a la función displaySongs
  } catch (error) {
    console.error(error);
    displaySongs([]);
  }
}


// Función para actualizar el estado de una canción
async function updateSongState(song_id, action) {
  try {
    const accessToken = await fetchAccessToken();
    const response = await fetch(`https://defiant-slug-top-hat.cyclic.app/${song_id}/${party_id}/${action}`, {
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
function displaySongs(songs, showButtons = false) {
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
          if (!showButtons) {
              acceptButton.style.display = 'none';
          }

          const rejectButton = document.createElement('button');
          rejectButton.className = "reject-song";
          rejectButton.innerText = "X";
          if (!showButtons) {
              rejectButton.style.display = 'none';
          }
          
            // Agregar los manejadores de eventos aquí
            acceptButton.addEventListener('click', async () => {
              const song_id = songItem.getAttribute('data-songid');
              if (await updateSongState(song_id, 'accept')) {
                // Mueve la canción al final de la lista de canciones aceptadas
                acceptedContainer.appendChild(songItem);
                songItem.classList.add("accepted");
                acceptButton.remove();
                rejectButton.remove();
              } else {
                console.error(`Failed to accept song with ID: ${song_id}`);
              }
            });
      
      
            rejectButton.addEventListener('click', async () => {
              const song_id = songItem.getAttribute('data-songid');
              if (await updateSongState(song_id, 'reject')) {
                // Mueve la canción al final de la lista de canciones rechazadas
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

let partyEnded = false;

document.querySelector('.end-party').addEventListener('click', function(event) {
    event.preventDefault();
    const endPartyButton = this; // O usa document.querySelector('.end-party') si 'this' no funciona

    if (!partyEnded) {
        // Muestra los botones de aceptar/rechazar
        document.querySelectorAll('.accept-song, .reject-song').forEach(button => {
            button.style.display = 'block';
        });
        endPartyButton.textContent = 'Finalizar Fiesta'; // Cambia el texto del botón
        partyEnded = true;
    } else {
        // Redirige a Historial.html
        window.location.href = 'Historial.html';
    }
});



// Función principal que inicia las operaciones
async function main() {
  console.log("MAIN");
  const accessToken = await fetchAccessToken();
  if (accessToken) {
      displaySongs([], false); // false para no mostrar los botones inicialmente
      await getSelectedSongs();
  }
}




// Evento para cargar las funciones principales cuando la página se carga
window.addEventListener("load", () => {
    const qrLink = document.getElementById('qrLink');
    qrLink.href = `Scan.html?party_id=${party_id}`;
    main();
});
