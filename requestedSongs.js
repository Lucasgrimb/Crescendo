document.addEventListener('DOMContentLoaded', function() {
  // Obtener el parámetro 'party_id' de la URL
  const params = new URLSearchParams(window.location.search);
  const partyId = params.get('party_id');

  // Llama a la función para obtener las canciones seleccionadas
  getSelectedSongs(partyId);

  // Función para obtener las canciones seleccionadas
  async function getSelectedSongs(party_id) {
      try {
          const response = await fetch(`https://crescendoapi-pro.vercel.app/api/selectedsongs/${party_id}`, {
              method: "GET",
              headers: {

              },
          });

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

  // Función para mostrar las canciones
  function displaySongs(songs) {
      const songContainer = document.getElementById('song-container');
      const acceptedContainer = document.querySelector('.song-container-accepted');
      const rejectedContainer = document.querySelector('.song-container-rejected')

      songContainer.innerHTML = "";
      acceptedContainer.innerHTML = ""; // Limpiar el contenedor de canciones aceptadas
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

              songDetails.appendChild(songTitle);
              songDetails.appendChild(songArtist);
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
  
  const express = require('express');
const app = express();

// Habilitar CORS para todas las solicitudes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://crescendo-nine.vercel.app'); // Reemplaza con tu dominio
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Resto de la configuración del servidor

app.listen(3000, () => {
  console.log('Servidor en funcionamiento en el puerto 3000');
});

});
