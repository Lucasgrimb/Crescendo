document.addEventListener('DOMContentLoaded', async () => {
    const accessToken = await fetchAccessToken();
    if (accessToken) {
        await loadPartiesList();
        document.getElementById('createPartyButton').addEventListener('click', createParty);
    } else {
        console.error('No se pudo obtener el token de acceso.');
        // Manejar la situación en la que no se puede obtener un token (mostrar mensaje, redirigir, etc.)
    }
});

async function fetchAccessToken() {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await fetch('https://defiant-slug-top-hat.cyclic.app/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });

        if (!response.ok) {
            throw new Error('La petición de token no fue exitosa');
        }

        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        return data.accessToken;
    } catch (error) {
        console.error('Hubo un problema con la petición de fetch:', error);
        return null;
    }
}

async function fetchWithTokenRefresh(url, options) {
    let response = await fetch(url, options);
    if (response.status === 401) {
        const newAccessToken = await fetchAccessToken();
        if (!newAccessToken) {
            throw new Error('No se pudo obtener un nuevo token de acceso');
        }
        options.headers['Authorization'] = `Bearer ${newAccessToken}`;
        response = await fetch(url, options);
    }
    return response;
}

async function loadPartiesList() {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetchWithTokenRefresh('https://defiant-slug-top-hat.cyclic.app/api/partyhistory', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
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

            // Modificado para redirigir al usuario al hacer clic
            partyElement.addEventListener('click', () => {
                window.location.href = `/Qr%20code.html?party_id=${party.party_id}`;
            });

            partiesList.appendChild(partyElement);
        });
    } else {
        partiesList.innerHTML = '<p>Todavía no tienes fiestas. ¡Crea una!</p>';
    }
}


async function createParty() {
    const partyName = prompt('Ingrese el nombre de la fiesta:');
    if (!partyName) return;
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetchWithTokenRefresh('https://defiant-slug-top-hat.cyclic.app/api/createParty', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ partyName })
    });

    const data = await response.json();
    if (data.success) {
        window.location.href = `/Qr%20code.html?party_id=${data.party_id}`;
    } else {
        alert('No se pudo crear la fiesta. Intente nuevamente.');
    }
}




