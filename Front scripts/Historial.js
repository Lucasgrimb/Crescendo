const accessToken = localStorage.getItem('accessToken');
document.addEventListener('DOMContentLoaded', async () => {
    
    if (accessToken) {
        await loadPartiesList();
        document.getElementById('createPartyButton').addEventListener('click', createParty);
    } else {
        console.error('No se pudo obtener el token de acceso.');
        // Mostrar un mensaje al usuario y redirigir a la página de inicio de sesión o página principal
        alert('Su sesión ha expirado o no está autenticado. Por favor, inicie sesión nuevamente.');
        window.location.href = '/Hello page.html'; // Reemplaza '/login.html' con la URL de tu página de inicio de sesión
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

async function loadPartiesList() {
    const response = await attemptFetchWithTokenRenewal(fetchPartiesList);
    if (!response) return;

    const data = await response.json();
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
    const hostName = prompt('Ingrese el nombre del anfitrión:');
    
    if (!partyName || !hostName) return;

    const response = await attemptFetchWithTokenRenewal(() => sendCreateRequest(partyName, hostName, accessToken));

    if (!response) return;

    const data = await response.json();

    if (data.success) {
        window.location.href = `/Qr%20code.html?party_id=${data.party_id}`;
    } else {
        alert('No se pudo crear la fiesta. Intente nuevamente.');
    }
}

async function attemptFetchWithTokenRenewal(fetchFunction) {
    let accessToken = localStorage.getItem('accessToken');
    let response = await fetchFunction(accessToken);

    if (response.status === 403) {
        accessToken = await fetchAccessToken();
        if (!accessToken) {
            console.error('No se pudo renovar el token de acceso.');
            return null;
        }
        response = await fetchFunction(accessToken);
    }

    return response.ok ? response : null;
}

async function fetchPartiesList(token) {
    return fetch('https://energetic-gown-elk.cyclic.app/api/partyhistory', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

async function sendCreateRequest(partyName, hostName, token) {
    return fetch('https://energetic-gown-elk.cyclic.app/api/createParty', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ partyName, hostName })
    });
}





