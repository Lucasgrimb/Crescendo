document.addEventListener('DOMContentLoaded', function () {
    const createPartyBtn = document.getElementById('createPartyBtn');
    const partiesList = document.getElementById('partiesList');

    createPartyBtn.addEventListener('click', displayCreatePartyForm);

    function displayCreatePartyForm() {
        const formHtml = `
            <form id="createPartyForm">
                <input type="text" id="partyName" placeholder="Nombre de la fiesta" required />
                <button type="submit">Crear Fiesta</button>
            </form>
        `;
        partiesList.innerHTML = formHtml;

        document.getElementById('createPartyForm').addEventListener('submit', handleCreateParty);
    }

    function handleCreateParty(event) {
        event.preventDefault();
        const partyName = document.getElementById('partyName').value;
        fetch('https://crescendoapi-pro.vercel.app/api/createParty', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ partyName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadUserParties(); // Recargar la lista de fiestas
            } else {
                console.error(data.error);
            }
        })
        .catch(error => console.error('Error al crear la fiesta:', error));
    }

    function loadUserParties() {
        fetch('https://crescendoapi-pro.vercel.app/api/getDjHistory', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderPartiesList(data.parties);
            } else {
                console.error(data.error);
            }
        })
        .catch(error => console.error('Error al obtener fiestas:', error));
    }

    function renderPartiesList(parties) {
        partiesList.innerHTML = ''; // Limpiar la lista actual

        parties.forEach(party => {
            const partyElement = document.createElement('div');
            partyElement.className = 'party';
            partyElement.innerHTML = `<h2>${party.party_name} - ${party.party_date}</h2>`;
            partyElement.addEventListener('click', () => renderSongsList(party.songs));
            partiesList.appendChild(partyElement);
        });
    }

    function renderSongsList(songs) {
        partiesList.innerHTML = ''; // Limpiar la lista actual

        const backButton = document.createElement('button');
        backButton.textContent = 'Volver a fiestas';
        backButton.addEventListener('click', loadUserParties);
        partiesList.appendChild(backButton);

        const songsList = document.createElement('ul');
        songs.forEach(song => {
            const songItem = createSongElement(song);
            songsList.appendChild(songItem);
        });
        partiesList.appendChild(songsList);
    }

    function createSongElement(song) {
        const songItem = document.createElement('li');
        songItem.className = `song-item ${song.song_state}`;
        songItem.innerHTML = `
            <img src="${song.image}" alt="${song.name}" class="song-image">
            <div class="song-details">
                <p class="song-title">${song.name}</p>
                <p class="song-artist">${song.artist}</p>
            </div>
        `;
        return songItem;
    }

    loadUserParties(); // Cargar las fiestas al cargar la página
});
