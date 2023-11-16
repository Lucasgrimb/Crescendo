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
        const response = await fetch('https://energetic-gown-elk.cyclic.app/api/token', {
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


async function fetchAccessToken() {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await fetch('https://energetic-gown-elk.cyclic.app/api/token', {
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

async function loadPartiesList() {
    async function fetchPartiesList(token) {
        const response = await fetch('https://energetic-gown-elk.cyclic.app/api/partyhistory', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response;
    }

    let accessToken = localStorage.getItem('accessToken');
    let response = await fetchPartiesList(accessToken);

    // Si el token es inválido o expiró, intenta obtener uno nuevo
    if (response.status === 403) {
        accessToken = await fetchAccessToken();
        if (!accessToken) {
            console.error('No se pudo renovar el token de acceso. Intente iniciar sesión nuevamente.');
            return;
        }
        response = await fetchPartiesList(accessToken);
    }

    // Procesar la respuesta
    if (!response.ok) {
        console.error('Error al cargar la lista de fiestas');
        return;
    }

    const data = await response.json();
    console.log(data);
    const partiesList = document.getElementById('partiesList');
    partiesList.innerHTML = '';
    
    if (data.parties && data.parties.length > 0) {
        data.parties.forEach(party => {
            const partyElement = document.createElement('div');
            partyElement.innerText = party.party_name;
            partyElement.classList.add('party');
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

    async function sendCreateRequest(token) {
        const response = await fetch('https://energetic-gown-elk.cyclic.app/api/createParty', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ partyName })
        });
        return response;
    }

    let accessToken = localStorage.getItem('accessToken');
    let response = await sendCreateRequest(accessToken);

    // Si el token es inválido o expiró, intenta obtener uno nuevo
    if (response.status === 403) {
        accessToken = await fetchAccessToken();
        if (!accessToken) {
            alert('No se pudo renovar el token de acceso. Intente iniciar sesión nuevamente.');
            return;
        }
        response = await sendCreateRequest(accessToken);
    }

    // Procesar la respuesta
    const data = await response.json();
    if (data.success) {
        window.location.href = `/Qr%20code.html?party_id=${data.party_id}`;
    } else {
        alert('No se pudo crear la fiesta. Intente nuevamente.');
    }
}





