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

    const qrContainer = document.getElementById("qr-container");
    if (qrContainer) {
      const imgElement = document.createElement("img");
      imgElement.src = data.qr_code;
      qrContainer.appendChild(imgElement);
    }
    
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

    // Haz algo con los datos, como mostrar las canciones
    displaySongs(data);
  } catch (error) {
    console.error(error);
  }
}

function displaySongs(songs) {
  // Obtén el contenedor donde las canciones se mostrarán
  const songContainer = document.getElementById('song-container');

  // Limpia cualquier contenido previo
  songContainer.innerHTML = "";

  if (songs.length === 0) {
    // Si no hay canciones, muestra un mensaje
    const noSongsMessage = document.createElement('div');
    noSongsMessage.className = "no-songs";
    noSongsMessage.innerText = "Todavía no se pidió ninguna canción.";
    songContainer.appendChild(noSongsMessage);
  } else {
    // Itera sobre las canciones y crea una estructura HTML para cada una
    songs.forEach((song) => {
      const songItem = document.createElement('div');
      songItem.className = "song-item";

      const songImage = document.createElement('div');
      songImage.className = "song-image"; // Nueva clase para la imagen
      const imgElement = document.createElement("img");
      imgElement.src = song.image;
      imgElement.alt = `${song.name} - ${song.artist}`;
      songImage.appendChild(imgElement);

      const songDetails = document.createElement('div');
      songDetails.className = "song-details"; // Nueva clase para los detalles
      const songTitle = document.createElement('p');
      songTitle.className = "song-title";
      songTitle.innerHTML = `<strong>${song.name}</strong>`;
      const songArtist = document.createElement('p');
      songArtist.className = "song-artist";
      songArtist.innerText = song.artist;
      songDetails.appendChild(songTitle);
      songDetails.appendChild(songArtist);

      songItem.appendChild(songImage);
      songItem.appendChild(songDetails);

      songContainer.appendChild(songItem);
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

// Ejecuta la función main cuando se carga la página
window.addEventListener("load", main);
