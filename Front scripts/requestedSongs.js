document.addEventListener('DOMContentLoaded', function () {
    // Obtener el parámetro 'party_id' de la URL
    const params = new URLSearchParams(window.location.search);
    const party_id = params.get('party_id');

    // Llama a la función para obtener las canciones seleccionadas
    getSelectedSongs(party_id);

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
          noSongsMessage.innerText = "Cargando canciones pedidas...";
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
                // Ajusta las posiciones después de aceptar la canción
                ajustarPosiciones();
              } else {
                console.error(`Failed to accept song with ID: ${song_id}`);
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

});
