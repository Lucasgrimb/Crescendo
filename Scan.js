var accesstoken;
var party_id;
// Función para llamar al endpoint /api/token y obtener el accessToken

// Función para llamar al endpoint /api/token y obtener el accessToken

async function fetchAccessToken() {
    try {
      const response = await fetch('https://crescendoapi-pro.vercel.app/api/token', {
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
        const response = await fetch('https://crescendoapi-pro.vercel.app/api/startparty', {
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


        party_id = data.party_id;
                // Mostrar el QR en el HTML
                const qrContainer = document.getElementById("qr-container");
                if (qrContainer) {

                    const imgElement = document.createElement("img");
                    imgElement.src = data.qr_code;
                    qrContainer.appendChild(imgElement);

                } else {
                    console.log("qrContainer does not exist");  // Debería imprimir si el contenedor no existe
                }
                

              
                
        
        return data; // Devuelve los datos aquí

    } catch (error) {
        console.error(error);
        return null; // O también podrías manejar el error de alguna otra forma
    }
}
 async function main() {
    const accessToken = await fetchAccessToken();
    if (accessToken) {
        const partyData = await startParty(accessToken);
        console.log(partyData); // Debería mostrar los datos de la fiesta

        } else {
            console.log("mafi partydata_id")
        }
    }



// Ejecuta la función main cuando se carga la página
window.addEventListener("load", main);
