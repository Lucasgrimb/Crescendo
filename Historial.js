document.addEventListener('DOMContentLoaded', function () {
    const createPartyBtn = document.getElementById('createPartyBtn');
    const partiesList = document.getElementById('partiesList');

    // Evento para manejar la creación de una nueva fiesta
    createPartyBtn.addEventListener('click', handleCreateParty);

    // Manejador del evento para crear una nueva fiesta
    function handleCreateParty(event) {
        event.preventDefault(); // Prevenir la recarga por defecto del formulario, si es que existe
        fetch('https://crescendoapi-pro.vercel.app/api/createParty', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
            }
            // No es necesario enviar body ya que el nombre de la fiesta se generará en el servidor
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                loadUserParties(); // Recargar la lista de fiestas después de crear una nueva fiesta
            } else {
                console.error(data.error);
            }
        })
        .catch(error => {
            console.error('Error al crear la fiesta:', error);
        });
    }

    // Función para cargar las fiestas del usuario
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
        .catch(error => {
            console.error('Error al obtener fiestas:', error);
        });
    }

    // Función para mostrar la lista de fiestas
    function renderPartiesList(parties) {
        partiesList.innerHTML = ''; // Limpiar la lista actual

        if (parties.length === 0) {
            partiesList.innerHTML = '<p>No hay fiestas para mostrar. ¡Crea tu primera fiesta!</p>';
        } else {
            parties.forEach(party => {
                const partyElement = document.createElement('div');
                partyElement.className = 'party';
                partyElement.innerHTML = `<h2>${party.party_name} - ${party.party_date}</h2>`;
                partyElement.addEventListener('click', () => renderSongsList(party.songs));
                partiesList.appendChild(partyElement);
            });
        }
    }

    // Función para mostrar la lista de canciones de una fiesta seleccionada
    function renderSongsList(songs) {
        partiesList.innerHTML = ''; // Limpiar la lista actual

        const backButton = document.createElement('button');
        backButton.textContent = 'Volver a fiestas';
        backButton.addEventListener('click', loadUserParties);
        partiesList.appendChild(backButton);

        if (songs.length === 0) {
            partiesList.innerHTML += '<p>No hay canciones para mostrar en esta fiesta.</p>';
        } else {
            const songsList = document.createElement('ul');
            songs.forEach(song => {
                const songItem = createSongElement(song);
                songsList.appendChild(songItem);
            });
            partiesList.appendChild(songsList);
        }
    }

    // Función para crear el elemento HTML para una canción
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
