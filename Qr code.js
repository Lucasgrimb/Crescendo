var party_id;

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

// Función para iniciar la fiesta
async function startParty(accessToken) {
  try {
    const response = await fetch('https://crescendoapi-pro.vercel.app/api/startparty', {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (response.status === 403) {
      const newAccessToken = await fetchAccessToken();
      if (newAccessToken) {
        return startParty(newAccessToken);
      }
    }

    if (!response.ok) {
      throw new Error("No se pudo iniciar la fiesta");
    }

    const data = await response.json();
    party_id = data.party_id;


    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Función para obtener las canciones seleccionadas
async function getSelectedSongs(party_id, accessToken) {
  try {
    const response = await fetch(`https://crescendoapi-pro.vercel.app/api/selectedsongs/${party_id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (response.status === 403) {
      // Intenta obtener un nuevo accessToken si el anterior fue rechazado
      const newAccessToken = await fetchAccessToken();
      if (newAccessToken) {
        return getSelectedSongs(party_id, newAccessToken);
      }
    }

    if (!response.ok) {
      throw new Error("No se pudo obtener las canciones seleccionadas");
    }

    const data = await response.json();
console.log(data);
    // Haz algo con los datos, como mostrar las canciones
    displaySongs(data);
  } catch (error) {
    console.error(error);
  }
}


async function updateSongState(songId, party_id, action) {
  try {
    const accessToken = await fetchAccessToken();
    const response = await fetch(`https://crescendoapi-pro.vercel.app/api/${songId}/${party_id}/${action}`, {
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
// ...

function displaySongs(songs) {
  const songContainer = document.getElementById('song-container');
  const acceptedContainer = document.querySelector('.song-container-accepted'); 
  const rejectedContainer = document.querySelector('.song-container-rejected')

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
    
          const rejectButton = document.createElement('button');
          rejectButton.className = "reject-song";
          rejectButton.innerText = "X";
    
      // Agregar los manejadores de eventos aquí
      acceptButton.addEventListener('click', async () => { // Marca la función como async
        const songId = songItem.getAttribute('data-songid');
        if (await updateSongState(songId, party_id, 'accept')) {
          const acceptSection = document.querySelector(".accept-peticion");
          acceptSection.appendChild(songItem);
          songItem.classList.add("accepted");
          acceptButton.remove();
          rejectButton.remove();
        } else {
          console.error(`Failed to accept song with ID: ${songId}`);
        }
      });
      rejectButton.addEventListener('click', async () => { // Marca la función como async
        const songId = songItem.getAttribute('data-songid');
        if (await updateSongState(songId, party_id, 'reject')) {
          // Mueve el elemento de canción a la sección de rechazadas
          const rejectSection = document.querySelector(".reject-peticion");
          rejectSection.appendChild(songItem);
          songItem.classList.add("rejected");
          acceptButton.remove();
          rejectButton.remove();
        } else {
          console.error(`Failed to reject song with ID: ${songId}`);
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
        acceptedContainer.appendChild(songItem); // Move it to the accepted container
        songItem.classList.add("accepted");
        acceptButton.remove();
        rejectButton.remove();
      } else if (songItem.getAttribute('data-songstate') === 'rejected') {
        const rejectSection = document.querySelector(".song-container-rejected");
        rejectSection.appendChild(songItem);
        songItem.classList.add("rejected");
        acceptButton.remove();
        rejectButton.remove();
      } else {
        songContainer.appendChild(songItem);
      }
    });
  }
}
    




// Función principal que se ejecuta al cargar la página
async function main() {
  const accessToken = await fetchAccessToken();
  if (accessToken) {
    const partyData = await startParty(accessToken);
    if (partyData && party_id) {
      await getSelectedSongs(party_id, accessToken);
    } else {
      console.log("No hay datos de la fiesta o party_id");
    }
  }
}

// Reemplaza el código jQuery por JavaScript puro
const songContainer = document.getElementById('song-container');
songContainer.addEventListener('scroll', function () {
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
});

        
        // Ejecuta la función main cuando se carga la página
        window.addEventListener("load", main);
        