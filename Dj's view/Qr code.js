// Obtenemos referencia a los elementos del DOM
const acceptBtns = document.querySelectorAll(".accept-btn");
const rejectBtns = document.querySelectorAll(".reject-btn");
const endPartyBtn = document.querySelector(".end-party-btn");

// Agregamos los event listeners a los botones de aceptar y rechazar canciones
acceptBtns.forEach((btn) => {
    btn.addEventListener("click", (event) => {
        const songTitle = event.target.parentElement.querySelector(".song-title").textContent;
        // Aquí puedes agregar la lógica para aceptar la canción y realizar las acciones necesarias
        // cuando el DJ decide aceptar la canción
        console.log(`Has aceptado la canción: ${songTitle}`);
    });
});

rejectBtns.forEach((btn) => {
    btn.addEventListener("click", (event) => {
        const songTitle = event.target.parentElement.querySelector(".song-title").textContent;
        // Aquí puedes agregar la lógica para rechazar la canción y realizar las acciones necesarias
        // cuando el DJ decide rechazar la canción
        console.log(`Has rechazado la canción: ${songTitle}`);
    });
});

// Agregamos el event listener al botón "End Party"
endPartyBtn.addEventListener("click", () => {
    // Aquí puedes agregar la lógica para finalizar la fiesta y realizar las acciones necesarias
    // cuando el DJ decide terminar la fiesta
    console.log("Has terminado la fiesta");
    // Redirigir a la página de inicio o donde desees
    window.location.href = "Start Party.html";
});

function redirectToQrCode() {
    window.location.href = "Qr code.html";
}

