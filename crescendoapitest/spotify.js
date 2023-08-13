

// El resto de tu código

const BASE_URL = 'https://api.spotify.com/v1';



async function getSpotifyToken(client_id, client_secret) {
    const { default: fetch } = await import('node-fetch');

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
}
 


async function getSongInfo(songId, token) {
    const { default: fetch } = await import('node-fetch');

    const response = await fetch(`${BASE_URL}/tracks/${songId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });

    const data = await response.json();
    return {
        name: data.name,
        artist: data.artists[0].name, // Asumimos que sólo quieres el primer artista
        image: data.album.images[0].url // Asumimos que quieres la primera imagen
    };
}

async function fetchSongInfo(songId, client_id, client_secret) {
    const token = await getSpotifyToken(client_id, client_secret);
    const songInfo = await getSongInfo(songId, token);
    return songInfo;
}






async function isValidSongOnSpotify(songId, client_id, client_secret) {
    const token = await getSpotifyToken(client_id, client_secret);
    
    const { default: fetch } = await import('node-fetch');

    const response = await fetch(`${BASE_URL}/tracks/${songId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });

    return response.status === 200;
}

// ... Resto de tu código ...

module.exports = {
    fetchSongInfo,
    isValidSongOnSpotify, 
};












// Uso de la función
const CLIENT_ID = process.env.clientId;
const CLIENT_SECRET = process.env.clientSecret;
const SONG_ID = '03Ntkzzjkz7nFJldcPbL90?si=80e1dfdf594a45d4';

// fetchSongInfo(SONG_ID, CLIENT_ID, CLIENT_SECRET).then(info => {
//     console.log(info); // Esto imprimirá la información de la canción en formato JSON.
// });













