document.addEventListener('DOMContentLoaded', async () => {
    // Obtener el party_id de la URL
const urlParams = new URLSearchParams(window.location.search);
const party_id = urlParams.get('party_id');
    
        await loadPartiesList(party_id);
    
});




async function loadPartiesList(party_id) {
    // Asegúrate de que party_id esté definido
    if (!party_id) {
        console.error('No se ha proporcionado party_id');
        return;
    }

    const response = await fetch(`https://defiant-slug-top-hat.cyclic.app/api/partyhistoryP/${party_id}`, {
        method: 'GET'
    });

    const data = await response.json();
    console.log(data);
    const partiesList = document.getElementById('partiesList');
    partiesList.innerHTML = '';
    
    if (data.parties && data.parties.length > 0) {
        data.parties.forEach(party => {
            const partyElement = document.createElement('div');
            partyElement.innerText = party.party_name;
            partyElement.classList.add('party');

            // Redirige al usuario al hacer clic
            partyElement.addEventListener('click', () => {
                window.location.href = `/requestedSongs.html?party_id=${party.party_id}`;
            });

            partiesList.appendChild(partyElement);
        });
    } else {
        partiesList.innerHTML = '<p>Todavía no tienes fiestas. ¡Crea una!</p>';
    }
}





