// Supongamos que has guardado los IDs de las canciones en un array bajo la clave 'songIds' y el party_id bajo la clave 'partyId' en localStorage
const storedSongIds = localStorage.getItem('songIds'); // Esto devolverá una cadena JSON
const storedPartyId = localStorage.getItem('partyId');

if (!storedSongIds || !storedPartyId) {
  console.log("No hay datos en el localStorage");
} else {
  const songIds = JSON.parse(storedSongIds); // Convierte la cadena JSON en un array
  const party_id = storedPartyId; // Ya es una cadena, no necesita ser parseado

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
