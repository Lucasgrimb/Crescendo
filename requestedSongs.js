document.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  const partyId = params.get('party_id');

  // Conéctate al WebSocket del servidor
  const socket = new WebSocket('ws://localhost:3000'); // Reemplaza con la URL de tu servidor WebSocket

  // Cuando se abre la conexión WebSocket
  socket.addEventListener('open', (event) => {
    console.log('Conexión WebSocket establecida');
  });

  // Cuando se recibe un mensaje desde el servidor WebSocket
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    console.log('Datos recibidos del servidor WebSocket:', message);

    // Actualiza la interfaz de usuario con los datos recibidos
    displaySongs(message);
  });

  // Función para mostrar las canciones
  function displaySongs(songs) {
    const songContainer = document.getElementById('song-container');
    const acceptedContainer = document.querySelector('.song-container-accepted');
    const rejectedContainer = document.querySelector('.song-container-rejected');

    songContainer.innerHTML = '';
    acceptedContainer.innerHTML = ''; // Limpiar el contenedor de canciones aceptadas
    rejectedContainer.innerHTML = '';

    if (songs.length === 0) {
      const noSongsMessage = document.createElement('div');
      noSongsMessage.className = 'no-songs';
      noSongsMessage.innerText = 'No hay canciones para mostrar';
      songContainer.appendChild(noSongsMessage);
    } else {
      songs.forEach((song) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        songItem.setAttribute('data-songid', song.id);
        songItem.setAttribute('data-songstate', song.song_state);

        const songImage = document.createElement('div');
        songImage.className = 'song-image';
        const imgElement = document.createElement('img');
        imgElement.src = song.image;
        songImage.appendChild(imgElement);

        const songDetails = document.createElement('div');
        songDetails.className = 'song-details';
        const songTitle = document.createElement('p');
        songTitle.className = 'song-title';
        songTitle.innerText = song.name;
        const songArtist = document.createElement('p');
        songArtist.className = 'song-artist';
        songArtist.innerText = song.artist;

        songDetails.appendChild(songTitle);
        songDetails.appendChild(songArtist);
        songItem.appendChild(songImage);
        songItem.appendChild(songDetails);

        // Decide dónde añadir el songItem en función de su estado
        if (songItem.getAttribute('data-songstate') === 'accepted') {
          acceptedContainer.appendChild(songItem);
          songItem.classList.add('accepted');
        } else if (songItem.getAttribute('data-songstate') === 'rejected') {
          rejectedContainer.appendChild(songItem);
          songItem.classList.add('rejected');
        } else {
          songContainer.appendChild(songItem);
        }
      });
    }
  }
});
