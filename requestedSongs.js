var party_id;

// Función para obtener el accessToken
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

    if (!response.ok) throw new Error('Failed to fetch token');

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    return data.accessToken;
  } catch (error) {
    console.error('Fetch Error:', error);
    return null;
  }
}

// Función para iniciar la fiesta
async function startParty(accessToken) {
  try {
    const response = await fetch('https://crescendoapi-pro.vercel.app/api/startparty', {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });

    if (response.status === 403) {
      const newAccessToken = await fetchAccessToken();
      if (newAccessToken) return startParty(newAccessToken);
    }

    if (!response.ok) throw new Error('Failed to start party');

    const data = await response.json();
    party_id = data.party_id;
    localStorage.setItem('party_id', party_id);  // Store party_id in localStorage

    return data;
  } catch (error) {
    console.error('Fetch Error:', error);
    return null;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const accessToken = await fetchAccessToken();
  if (!accessToken) return;

  const partyData = await startParty(accessToken);
  if (!partyData) return;

  // Getting the songIds from localStorage
  const storedSongIds = localStorage.getItem('storedSongIds');
  if (!storedSongIds) {
    console.log("No songIds in localStorage for this party_id");
    return;
  }

  const songIds = JSON.parse(storedSongIds);
  const data = {
    songIds,
    party_id
  };

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  };

  fetch('https://crescendoapi-pro.vercel.app/api/get-multiple-songs', requestOptions)
    .then(response => response.json())
    .then(songs => {
      if (Array.isArray(songs)) {
        songs.forEach(song => {
          console.log(`Image: ${song.image}`);
          console.log(`Name: ${song.name}`);
          console.log(`Artist: ${song.artist}`);
          console.log(`SongState: ${song.songState}`);
          console.log('---');
        });
      } else {
        console.error('Songs is not an array:', songs);
      }
    })
    .catch(error => console.error('Error:', error));
});
