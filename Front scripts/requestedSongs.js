// Obtener el party_id de la URL
const urlParams = new URLSearchParams(window.location.search);
const party_id = urlParams.get('party_id');
console.log(party_id);


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
      noSongsMessage.innerText = "Todavía no se pidieron canciones";
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
        const requestNumber = document.createElement('p');
        requestNumber.className = "request-number";
        if (song.request_number<2){
        requestNumber.innerText = `${song.request_number} pedido`;
        }
        else{
            requestNumber.innerText = `${song.request_number} pedidos`;
        }
  
        songDetails.appendChild(songTitle);
        songDetails.appendChild(songArtist);
        songDetails.appendChild(requestNumber);
        songItem.appendChild(songImage);
        songItem.appendChild(songDetails);
  
        // Decide dónde añadir el songItem en función de su estado
        if (songItem.getAttribute('data-songstate') === 'accepted') {
          acceptedContainer.appendChild(songItem);
          songItem.classList.add("accepted");
        } else if (songItem.getAttribute('data-songstate') === 'rejected') {
          rejectedContainer.appendChild(songItem);
          songItem.classList.add("rejected");
        } else {
          songContainer.appendChild(songItem);
        }
      });
    }
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



    songDetails.appendChild(songTitle);
    songDetails.appendChild(songArtist);
    songItem.appendChild(songImage);
    songItem.appendChild(songDetails);

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


// Función principal que inicia las operaciones
async function main() {
    document.getElementById('loadingSpinner').style.display = 'block';
    await getSelectedSongs(party_id);
    document.getElementById('loadingSpinner').style.display = 'none';
}

window.addEventListener("load", () => {
    main();
});

const songContainer = document.getElementById('song-container');
songContainer.addEventListener('scroll', actualizarUltimaCancion);