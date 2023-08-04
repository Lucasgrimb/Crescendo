
// Animar el botón al pasar el cursor sobre él
function animateButton(isHover) {
    const startPartyBtn = document.querySelector(".start-party-btn");
    // Cambiar el tamaño del botón al pasar el cursor sobre él
    if (isHover) {
        startPartyBtn.style.transform = "scale(1.1)";
    } else {
        startPartyBtn.style.transform = "scale(1)";
    }
}

// Redirigir a la página "Qr code.html" al hacer clic en el botón "Start Party"
function redirectToQrCode() {
    window.location.href = "Qr code.html";
}
