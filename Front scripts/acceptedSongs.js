document.addEventListener('DOMContentLoaded', () => {
    const partyId = getPartyIdFromUrl();
    if(partyId) {
        fetchAcceptedSongs(partyId);
    } else {
        console.error('No party ID found in the URL');
    }
});

function getPartyIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('party_id'); // Asume que el ID de la fiesta está en el URL como ?party_id=tu_party_id
}

function fetchAcceptedSongs(partyId) {
    fetch(`https://energetic-gown-elk.cyclic.app/api/selectedsongs/${partyId}`)
        .then(response => response.json())
        .then(songs => {
            const acceptedSongs = songs.filter(song => song.song_state === 'accepted');
            const container = document.getElementById('song-container-accepted');

            acceptedSongs.forEach(song => displaySong(song, container));
        })
        .catch(error => console.error('Error loading songs:', error));
}


function displaySong(song, container) {
    const songItem = document.createElement('div');
    songItem.className = 'song-item';

    const songImage = document.createElement('div');
    songImage.className = 'song-image';
    const imgElement = document.createElement('img');
    imgElement.src = song.image;
    songImage.appendChild(imgElement);

    const songDetails = document.createElement('div');
    songDetails.className = 'song-details';
    const songTitle = document.createElement('p');
    songTitle.className = 'song-title';
    songTitle.innerText = song.name;
    const songArtist = document.createElement('p');
    songArtist.className = 'song-artist';
    songArtist.innerText = song.artist.name;

    songDetails.appendChild(songTitle);
    songDetails.appendChild(songArtist);
    songItem.appendChild(songImage);
    songItem.appendChild(songDetails);

    container.appendChild(songItem);
}
