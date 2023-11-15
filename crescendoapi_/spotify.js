

// El resto de tu código

const BASE_URL = 'https://api.spotify.com/v1';


//se obtiene el token de spotify
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
 

//se obtinen los datos de las canciones en spotify
async function getSongInfo(song_id, token, attempt = 1) {
    const { default: fetch } = await import('node-fetch');

    const response = await fetch(`${BASE_URL}/tracks/${song_id}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
    
    // Manejo de errores de la respuesta, incluyendo el límite de tasa
    if (!response.ok) {
        if (response.status === 429 && attempt <= 5) {
            const retryAfter = response.headers.get('Retry-After') || Math.pow(2, attempt);
            console.log(`Rate limit exceeded. Retrying after ${retryAfter} seconds.`);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            return await getSongInfo(song_id, token, attempt + 1);
        }
        const text = await response.text();
        console.error(`Error fetching song info: ${text}`);
        throw new Error(`Error fetching song info: ${text}`);
    }

    const data = await response.json();

    // Verificar que hay artistas en la respuesta y tomar el ID del primer artista
    if (!data.artists || data.artists.length === 0) {
        console.error(`No artists found for song: ${song_id}`);
        return null; // O manejar de otra manera
    }

    const artistId = data.artists[0].id;

    return {
        id: song_id, 
        name: data.name,
        artist: {
            id: artistId,
            name: data.artists[0].name
        },
        image: data.album.images[0].url
    };
}



//se obtiene el token de spotify y se realiza la busqueda de los datos de las canciones
async function fetchSongInfo(song_id, client_id, client_secret) {
    const token = await getSpotifyToken(client_id, client_secret);
    const songInfo = await getSongInfo(song_id, token);
    return songInfo;

}





//funcion para verificar si el id de una cancion es valido
async function isValidSongOnSpotify(song_id, client_id, client_secret) {
    const token = await getSpotifyToken(client_id, client_secret);
    const { default: fetch } = await import('node-fetch');

    try {
        const response = await fetch(`${BASE_URL}/tracks/${song_id}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After') || 5; // Utiliza un valor predeterminado si no se proporciona
            console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000)); // Espera el tiempo indicado
            return await isValidSongOnSpotify(song_id, client_id, client_secret); // Intenta de nuevo
        }

        return response.status === 200;
    } catch (error) {
        console.error('Error verifying song on Spotify:', error);
        return false;
    }
}

//Función para Obtener los Géneros de un Artista
async function getArtistGenres(artist_id, token) {
    const response = await fetch(`${BASE_URL}/artists/${artist_id}`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });

    if (!response.ok) {
        const errorDetail = await response.text();
        console.error(`Error fetching artist genres, Status: ${response.status}, Detail: ${errorDetail}`);
        return []; // Devuelve un array vacío en caso de error
    }

    const data = await response.json();
    return data.genres;
}




//Función para Obtener los Géneros de una Canción
async function getSongGenres(song_id, client_id, client_secret) {
    const token = await getSpotifyToken(client_id, client_secret);
    const songInfo = await getSongInfo(song_id, token);

    // Verificar si songInfo es válido y tiene un ID de artista
    if (!songInfo || !songInfo.artist || !songInfo.artist.id) {
        console.error(`Artist ID not found for song: ${song_id}`);
        return [];
    }

    return await getArtistGenres(songInfo.artist.id, token);
}




function findDominantGenre(genres) {
    let maxCount = 0;
    let dominantGenre = 'Unknown';

    for (const [genre, count] of Object.entries(genres)) {
        if (count > maxCount) {
            maxCount = count;
            dominantGenre = genre;
        }
    }

    return dominantGenre;
}










//exporto funcion fetchSongInfo
module.exports = {
    fetchSongInfo,
    getSongGenres,
    findDominantGenre
};


















