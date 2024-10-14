// Funciones de utilidad
function getPartyIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('party_id');
}

function generateQRCode(party_id) {
  const qrUrl = `https://crescendoapi-pro.vercel.app/Elegi%20Cancion.html?party_id=${party_id}`;
  const qrContainer = document.getElementById('qr-container');
  new QRCode(qrContainer, qrUrl);
}

// Función para compartir
function setupShareButton(party_id) {
  const shareButton = document.getElementById('shareButton');
  if (shareButton) {
      shareButton.addEventListener('click', () => {
          if (navigator.share) {
              navigator.share({
                  title: 'Compartir',
                  text: '¡Mira este código QR!',
                  url: `https://crescendoapi-pro.vercel.app/Elegi%20Cancion.html?party_id=${party_id}`
              })
              .then(() => console.log('Compartido con éxito'))
              .catch((error) => console.error('Error al compartir:', error));
          } else {
              console.error('La API de compartir no es compatible');
          }
      });
  }
}

// Función para guardar el QR
function setupSaveQRButton() {
  const guardarButton = document.getElementById('guardarButton');
  const qrImage = document.querySelector('#qr-container img');
  const enlaceDescarga = document.createElement('a');
  document.body.appendChild(enlaceDescarga);

  guardarButton.addEventListener('click', () => {
      enlaceDescarga.href = qrImage.src;
      enlaceDescarga.download = 'qr-code.png';
      enlaceDescarga.click();
  });
}

// Función principal
function main() {
  const party_id = getPartyIdFromUrl();
  if (party_id) {
      generateQRCode(party_id);
      setupShareButton(party_id);
      setupSaveQRButton();
  } else {
      console.log("No party ID found in URL");
  }
}

window.addEventListener("load", main);
