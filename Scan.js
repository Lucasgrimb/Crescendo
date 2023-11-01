var party_id;

// Función para llamar al endpoint /api/token y obtener el accessToken
async function fetchAccessToken() {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.error("No refresh token found in local storage");
      return null;
    }
    const response = await fetch('https://tricky-dove-poncho.cyclic.app/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch new access token");
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.accessToken;
  } catch (error) {
    console.error('Error in fetchAccessToken:', error);
    return null;
  }
}

// Función para iniciar la fiesta
async function startParty() {
  try {
    let accessToken = localStorage.getItem('accessToken');
    const response = await fetch('https://tricky-dove-poncho.cyclic.app/api/startparty', {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (response.status === 403) {
      accessToken = await fetchAccessToken();
      if (accessToken) {
        return startParty();
      }
    }

    if (!response.ok) {
      throw new Error("Failed to start the party");
    }

    const data = await response.json();
    party_id = data.party_id;
    // Show QR code
    const qrContainer = document.getElementById("qr-container");
    if (qrContainer) {
      const imgElement = document.createElement("img");
      imgElement.src = data.qr_code;
      qrContainer.appendChild(imgElement);
    }

    return data;
  } catch (error) {
    console.error('Error in startParty:', error);
    return null;
  }
}

// Main function
async function main() {
  const accessToken = await fetchAccessToken();
  if (accessToken) {
    const partyData = await startParty();
    if (partyData) {
      console.log('Party started:', partyData);
    } else {
      console.log("No party data");
    }
  } else {
    console.log("No access token");
  }
}

window.addEventListener("load", main);

// btn compartir
document.addEventListener('DOMContentLoaded', () => {
  const shareButton = document.getElementById('shareButton');
  
  shareButton.addEventListener('click', () => {
      if (navigator.share) {
          navigator.share({
              title: 'Compartir',
              text: '¡Mira este código QR!',
              url: `https://tricky-dove-poncho.cyclic.app/Elegi%20Cancion.html?party_id=${party_id}`

          })
          .then(() => console.log('Compartido con éxito'))
          .catch((error) => console.error('Error al compartir:', error));
      } else {
          console.error('La API de compartir no es compatible');
      }
  });
});

//btn guardar qr
document.addEventListener('DOMContentLoaded', function () {
  // Obtén una referencia al botón "Guardar" y la imagen del código QR
  var Guardar = document.getElementById("Guardar");
  var qrImage = document.getElementById("qrImage");

  if (Guardar) {
    // Agrega un evento clic al botón "Guardar"
    Guardar.addEventListener("click", function () {
      // Crea un enlace temporal
      var link = document.createElement("a");
      link.href = qrImage.src;
      link.download = "codigo_qr.png"; // Nombre del archivo a descargar

      // Simula un clic en el enlace para iniciar la descarga
      document.body.appendChild(link);
      link.click();

      // Limpia el enlace temporal
      document.body.removeChild(link);
    });
  } else {
    console.error("El elemento 'Guardar' no se encontró en el documento.");
  }
});

//Arranca la logica para que al tocar el btn guardar se guarde la foto del qr

// Obtén una referencia al botón "Guardar"
const guardarButton = document.getElementById('guardarButton');

// Agrega un evento click al botón
guardarButton.addEventListener('click', () => {
    // Obtén la imagen del QR desde el DOM
    const qrImage = document.querySelector('#qr-container img');

    // Crea un elemento <a> para descargar la imagen
    const enlaceDescarga = document.createElement('a');
    enlaceDescarga.href = qrImage.src;
    enlaceDescarga.download = 'qr-code.png';

    // Simula un clic en el enlace para iniciar la descarga
    enlaceDescarga.click();
});

