//Tomo el party_id de la url
function getPartyIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('party_id');
}

//genero el qr y lo pongo en su container
function generateQRCode(party_id) {
  const qrUrl = `https://crescendo-nine.vercel.app/Elegi%20Cancion.html?party_id=${party_id}`;
  const qrContainer = document.getElementById('qr-container');
  new QRCode(qrContainer, qrUrl);
}


// Main function
async function main() {
  const party_id = getPartyIdFromUrl();
  if (party_id) {
      generateQRCode(party_id);
  } else {
      console.log("No party ID found in URL");
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
              url: `https://crescendo-nine.vercel.app/Elegi%20Cancion.html?party_id=${party_id}`

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

