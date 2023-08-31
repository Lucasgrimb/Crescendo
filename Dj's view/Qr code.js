document.addEventListener('DOMContentLoaded', (event) => {
    fetch('http://localhost:3000/api/startparty', {
        method: 'GET',
        headers: {

        },
        credentials: 'include',  // Importante: esto envía cookies HTTP-only
    })
    .then(response => response.json())
    .then(data => {
        // Hacer algo con los datos recibidos, por ejemplo, mostrar el QR code
        console.log(data);  // Aquí puedes hacer algo con el QR code
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});
