// Supongamos que has guardado el party_id bajo la clave 'partyId' en localStorage
const storedPartyId = localStorage.getItem('partyId');

if (!storedPartyId) {
  console.log("No hay partyId en el localStorage");
} else {
  const party_id = storedPartyId; // Ya es una cadena, no necesita ser parseado
  
  // Obteniendo los songIds asociados al party_id desde localStorage
  const storedSongIds = localStorage.getItem(party_id); // Esto devolverá una cadena JSON

  if (!storedSongIds) {
    console.log("No hay songIds en el localStorage para este party_id");
  } else {
    const songIds = JSON.parse(storedSongIds); // Convierte la cadena JSON en un array

    // Datos a enviar en el cuerpo de la solicitud POST
    const data = {
      songIds,
      party_id
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
  }
}

