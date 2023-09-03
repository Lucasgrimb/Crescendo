var accesstoken;
var party_id;

// Función para obtener el token de acceso
async function fetchAccessToken() {
    try {
        const response = await fetch('http://localhost:3000/api/token', {
            method: "POST",
            credentials: "include",
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
        const response = await fetch('http://localhost:3000/api/startparty', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`
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
        const imgElement = document.createElement("img");
        imgElement.src = data.qr_code;
        qrContainer.appendChild(imgElement);

        return data;

    } catch (error) {
        console.error(error);
        return null;
    }
}

// Función para obtener las canciones seleccionadas
async function getSelectedSongs(party_id, accessToken) {
    try {
        const response = await fetch(`http://localhost:3000/api/selectedsongs/${party_id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            },
        });

        if (response.status === 403) {
            const newAccessToken = await fetchAccessToken();
            if (newAccessToken) {
                return getSelectedSongs(party_id, newAccessToken);
            }
        }

        if (!response.ok) {
            throw new Error("No se pudo obtener las canciones seleccionadas");
        }

        const data = await response.json();

        const songDetails = await Promise.all(data.map(songId => fetchSongDetails(songId, accessToken)));
        updateSongList(songDetails);

    } catch (error) {
        console.error(error);
    }
}

// Función para obtener detalles de una canción de Spotify
async function fetchSongDetails(songId, accessToken) {
    try {
        const url = `https://api.spotify.com/v1/tracks/${songId}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.status === 403) {
            // Intenta obtener un nuevo accessToken si el anterior fue rechazado
            const newAccessToken = await fetchAccessToken();
            if (newAccessToken) {
                return getSelectedSongs(party_id, newAccessToken); 
            }
        }

        if (!response.ok) {
            throw new Error('Error fetching song details');
        }

        const data = await response.json();

        return {
            title: data.name,
            artist: data.artists.map(artist => artist.name).join(", "),
            imageUrl: data.album.images[0].url
        };

    } catch (error) {
        console.error(error);
        return null;
    }
}




// Función para actualizar la lista de canciones en el DOM
function updateSongList(songs) {
    const songContainer = document.getElementById("song-container");
    while (songContainer.firstChild) {
        songContainer.removeChild(songContainer.firstChild);
    }

    songs.forEach(song => {
        const songElement = document.createElement("div");
        songElement.className = "song";
        
        const imgElement = document.createElement("img");
        imgElement.src = song.image;
        songElement.appendChild(imgElement);
        
        const titleElement = document.createElement("p");
        titleElement.innerText = song.title;
        songElement.appendChild(titleElement);
        
        const artistElement = document.createElement("p");
        artistElement.innerText = song.artist;
        songElement.appendChild(artistElement);
        
        songContainer.appendChild(songElement);
    });
}

// Función principal
async function main() {
    const accessToken = await fetchAccessToken();
    if (accessToken) {
        const partyData = await startParty(accessToken);
        if (partyData && party_id) {
            await getSelectedSongs(party_id, accessToken);
        }
    }
}

window.addEventListener("load", main);
