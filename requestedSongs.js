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


document.addEventListener('DOMContentLoaded', async () => {
    // Esta función se ejecuta cuando la página se ha cargado completamente
  
    // Obtiene el accessToken (también actualiza el token en localStorage si es necesario)
    const accessToken = await fetchAccessToken();
    
    if (!accessToken) {
      console.log("No se pudo obtener el token de acceso.");
      return;
    }
  
    // Inicia la fiesta (Esto actualizará el party_id)
    const partyData = await startParty(accessToken);
  
    if (!partyData) {
      console.log("No se pudo iniciar la fiesta.");
      return;
    }
  
    // Aquí, party_id debería estar establecido por startParty
    const storedPartyId = localStorage.getItem(party_id); // Debería ser igual a party_id
  
    if (!storedPartyId) {
      console.log("No hay partyId en el localStorage");
      return;
    }

  
    const songIds = JSON.parse(storedPartyId); // Convierte la cadena JSON en un array
    
    // Datos a enviar en el cuerpo de la solicitud POST
    const data = {
      songIds,
      party_id: storedPartyId
    };
  
    // Opciones de la solicitud fetch
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    };
  
    // Realizar la solicitud al endpoint
    fetch('https://crescendoapi-pro.vercel.app/api/get-multiple-songs', requestOptions)
      .then(response => response.json())
      .then(songs => {
        // Mostrar la información en la consola
        songs.forEach(song => {
          console.log(`Foto: ${song.image}`);
          console.log(`Nombre: ${song.name}`);
          console.log(`Artista: ${song.artist}`);
          console.log(`Estado: ${song.songState}`);
          console.log('---');
        });
      })
      .catch(error => console.error('Error:', error));
  });
  