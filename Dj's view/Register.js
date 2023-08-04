function registerUser() {
    const email = document.getElementById("email").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Validar que los campos no estén vacíos
    if (email === "" || username === "" || password === "") {
        alert("Por favor, complete todos los campos.");
        return;
    }

    // Mostrar el mensaje de registro exitoso en una alerta
    const userData = {
        email: email,
        username: username,
        password: password,
    };

    const successMessage = document.getElementById("successMessage");
    successMessage.innerText = `¡Registro exitoso!\n\nCorreo electrónico: ${userData.email}\nNombre de usuario: ${userData.username}\nContraseña: ${userData.password}`;
    successMessage.style.display = "block";

    // Limpiar los campos después de mostrar el mensaje
    document.getElementById("email").value = "";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";

    // Redirigir a la página "success.html"
    window.location.href = "Start Party.html";
}
