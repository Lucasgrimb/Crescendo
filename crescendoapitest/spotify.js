// URL de la API de autorización de Spotify para obtener el token de acceso
const authEndpoint = 'https://accounts.spotify.com/api/token';

// Función para obtener el token de acceso mediante la autenticación "Client Credentials"
async function getAccessToken() {
    try {
        // Realizar una solicitud POST a la API de autorización de Spotify con las credenciales de cliente
        const response = await fetch(authEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(`?:?`, [process.env.clientId, process.env.clientSecret]),
            },
            body: 'grant_type=client_credentials',
        });

        // Verificar si la solicitud fue exitosa
        if (!response.ok) {
            throw new Error('No se pudo obtener el token de acceso');
        }

        // Obtener los datos de la respuesta como JSON y devolver el token de acceso
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error(error);
        return null;
    }
}

