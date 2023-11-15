const { QueryDB, QueryDBp } = require("./SQL");

async function getDJSongsStats(username) {
    try {
    
        // Obtener todos los party_id asociados a ese username
        const [parties] = await QueryDBp(`SELECT party_id FROM party WHERE username = ?`, [username]);
        const totalParties = parties.length; // Contar el total de fiestas

        // Contar todas las canciones y las aceptadas para esos party_id
        let totalRequests = 0;
        let acceptedSongs = 0;

        for (const party of parties) {
            const [songs] = await QueryDBp(`SELECT song_id, song_state FROM songs WHERE party_id = ?`, [party.party_id]);
            totalRequests += songs.length;
            acceptedSongs += songs.filter(song => song.song_state === 'accepted').length;
        }

        return {
            total_parties: totalParties, 
            total_requests: totalRequests,
            accepted_songs: acceptedSongs
        };
    } catch (error) {
        console.error('Error in getDJSongsStats:', error);
        throw error;
    }
}




//---------------------------------------------------------

//a. Función para Obtener IDs de Canciones Aceptadas

// Este código va en un archivo separado en la misma carpeta de tu API
async function getAcceptedSongIds(username) {
    const [parties] = await QueryDBp(`SELECT party_id FROM party WHERE username = ?`, [username]);
    let songIds = [];

    for (const party of parties) {
        const [songs] = await QueryDBp(`SELECT song_id FROM songs WHERE party_id = ? AND song_state = 'accepted'`, [party.party_id]);
        songIds = songIds.concat(songs.map(song => song.song_id));
    }

    return songIds;
}

//b. Función para Obtener Géneros de Spotify con Caché
// Este código también va en un archivo separado

const client_id = process.env.clientId
const client_secret = process.env.clientSecret

const genreCache = {};
const { getSongGenres } = require('./spotify.js'); 
async function getGenresFromSpotify(songIds) {
    let genres = {};

    for (const songId of songIds) {
        if (genreCache[songId]) {
            mergeGenres(genres, genreCache[songId]);
            continue;
        }

        const trackGenres = await getSongGenres(songId, client_id, client_secret);
        mergeGenres(genres, trackGenres);
        genreCache[songId] = trackGenres;
    }
    console.log("Géneros obtenidos:", genres); // Agregar para depuración
    return genres;
}

function mergeGenres(mainGenres, newGenres) {
    newGenres.forEach(genre => {
        if (mainGenres[genre]) {
            mainGenres[genre]++;
        } else {
            mainGenres[genre] = 1;
        }
    });
}






//exporto funcion getDjSongStats
module.exports = {
    getDJSongsStats,
    getAcceptedSongIds, 
    getGenresFromSpotify
};