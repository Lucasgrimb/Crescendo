var accesstoken;
var party_id;
// Función para llamar al endpoint /api/token y obtener el accessToken

async function fetchAccessToken() {
    try {
      const response = await fetch('http://localhost:3000/api/token', {
        method: "POST",  // Actualizado a POST
        credentials: "include",  // Para enviar cookies
      });
      if (response.status !== 200) {
        throw new Error("No se pudo obtener el accessToken");
      }
      const data = await response.json();
      accesstoken = data.accessToken;
      return data.accessToken;
    } catch (error) {
      console.error(error);
      return null;
    }
  }


// Función para iniciar la fiesta
async function startParty(accessToken) {
    try {
        const response = await fetch('http://localhost:3000/api/startparty', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
        });

        if (response.status === 403) {
            // Intenta obtener un nuevo accessToken si el anterior fue rechazado
            const newAccessToken = await fetchAccessToken();
            if (newAccessToken) {
                return startParty(newAccessToken); 
            }
        }

        if (!response.ok) {
            throw new Error("No se pudo iniciar la fiesta");
        }

        const data = await response.json();
        // Haz algo con los datos, como mostrar el código QR
        console.log(data);
        party_id = data.party_id;
        
        return data; // Devuelve los datos aquí
    } catch (error) {
        console.error(error);
        return null; // O también podrías manejar el error de alguna otra forma
    }
}


// Función para obtener las canciones seleccionadas
async function getSelectedSongs(party_id, accessToken) {
    try {
        const response = await fetch(`http://localhost:3000/api/selectedsongs/${party_id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
        });

        if (response.status === 403) {
            // Intenta obtener un nuevo accessToken si el anterior fue rechazado
            const newAccessToken = await fetchAccessToken();
            if (newAccessToken) {
                return getSelectedSongs(party_id, newAccessToken); 
            }
        }

        if (!response.ok) {
            throw new Error("No se pudo obtener las canciones seleccionadas");
        }

        const data = await response.json();
        // Haz algo con los datos, como mostrar las canciones
        console.log(data);
    } catch (error) {
        console.error(error);
    }
}


// Función principal que se ejecuta al cargar la página
// Función principal que se ejecuta al cargar la página
async function main() {
    const accessToken = await fetchAccessToken();
    if (accessToken) {
        const partyData = await startParty(accessToken);
        console.log(partyData); // Debería mostrar los datos de la fiesta

        if (partyData && party_id) {  // Usa partyData en lugar de accessToken aquí
            await getSelectedSongs(party_id, accessToken);
        } else {
            console.log("mafi partydata_id")
        }
    }
}


// Ejecuta la función main cuando se carga la página
window.addEventListener("load", main);
