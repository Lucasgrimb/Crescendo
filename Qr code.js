var accesstoken;
var party_id;


// Función para llamar al endpoint /api/token y obtener el accessToken

async function fetchAccessToken() {
    try {
      const response = await fetch('https://crescendoapi-pro.vercel.app/api/token', {
        method: "POST",  // Actualizado a POST
        credentials: "include",  // Para enviar cookies
      });
      if (response.status !== 200) {
        throw new Error("No se pudo obtener el accessToken");
      }
      const data = await response.json();
      accesstoken = data.accessToken;
      return data.accessToken;
    } catch (error) {
      console.error(error);
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
            // Intenta obtener un nuevo accessToken si el anterior fue rechazado
            const newAccessToken = await fetchAccessToken();
            if (newAccessToken) {
                return startParty(newAccessToken); 
            }
        }

        if (!response.ok) {
            throw new Error("No se pudo iniciar la fiesta");
        }

        const data = await response.json();

        // Haz algo con los datos, como mostrar el código QR
        console.log(data);
        party_id = data.party_id;
                // Mostrar el QR en el HTML
                const qrContainer = document.getElementById("qr-container");
                if (qrContainer) {
                    const imgElement = document.createElement("img");
                    imgElement.src = data.qr_code;
                    qrContainer.appendChild(imgElement);
                }
        
        return data; // Devuelve los datos aquí

    } catch (error) {
        console.error(error);
        return null; // O también podrías manejar el error de alguna otra forma
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
  
        const songImage = document.createElement('img');
        songImage.src = song.image;
        songImage.alt = `${song.name} - ${song.artist}`;
  
        const songInfo = document.createElement('div');
        songInfo.innerHTML = `<p><strong>${song.name}</strong></p><p>${song.artist}</p>`;
  
        songItem.appendChild(songImage);
        songItem.appendChild(songInfo);
  
        songContainer.appendChild(songItem);
      });
    }
  }
  
  

// Función principal que se ejecuta al cargar la página
// Función principal que se ejecuta al cargar la página
async function main() {
    const accessToken = await fetchAccessToken();
    if (accessToken) {
        const partyData = await startParty(accessToken);
        console.log(partyData); // Debería mostrar los datos de la fiesta
        console.log(party_id)
        if (partyData && party_id) {  // Usa partyData en lugar de accessToken aquí
            await getSelectedSongs(party_id, accessToken);
        } else {
            console.log("mafi partydata_id")
        }
    }
}
// prueba gpt franco 

// Ejecuta la función main cuando se carga la página
window.addEventListener("load", main);
