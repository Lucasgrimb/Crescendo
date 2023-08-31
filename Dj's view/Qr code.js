// En Qr code.html o en un archivo JS vinculado a esa página
document.addEventListener('DOMContentLoaded', (event) => {
  
    fetch('/api/startparty', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
    })
    .then(response => response.json())
    .then(data => {
      // Hacer algo con los datos recibidos, por ejemplo, mostrar el QR code
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  });
  