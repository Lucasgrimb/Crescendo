document.addEventListener('DOMContentLoaded', () => {
    // Obtener el party_id de la URL
    const params = new URLSearchParams(window.location.search);
    const party_id = params.get('party_id');

    if (party_id) {
        loadDjProfile(party_id);
    } else {
        console.error("No se encontró party_id en la URL.");
    }

    // Configurar el enlace de historial de fiestas
    const historyLink = document.getElementById('historial-fiestas-link');
    if (historyLink) {
        historyLink.addEventListener('click', () => {
            window.location.href = `/HistorialP.html?party_id=${party_id}`;
        });
    }
});

async function loadDjProfile(party_id) {
    try {
        const response = await fetch(`https://crescendoapi-pro.vercel.app/api/PerfilDJ/${party_id}`);
        if (!response.ok) {
            throw new Error('Error al obtener datos del DJ');
        }
        const data = await response.json();

        displayDjProfile(data);
    } catch (error) {
        console.error('Error en loadDjProfile:', error);
    }
}

function displayDjProfile(data) {
    document.getElementById('total-parties').textContent = data.total_parties;
    document.getElementById('total-requests').textContent = data.total_requests;
    document.getElementById('accepted-songs').textContent = data.accepted_songs;
    document.getElementById('dominant-genre').textContent = data.dominantGenre;
}
