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

// main.js

const button = document.getElementById('button');

button.addEventListener('click', async function () {
    event.preventDefault();  // Prevenimos la recarga automática del formulario

    const userName = ""; 
    const password = ""; 

    // Crear el objeto loginData con los valores
    const loginData = {
        userName: userName,
        password: password
    };

    // Mostrar el objeto loginData en la consola
    console.log(loginData);

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const responseData = await response.json();
        console.log(responseData);  // Log the response data

        if (responseData.ok) {
            // Successful login
            document.getElementById('message').textContent = 'Login successful!';
        } else {
            // Failed login
            document.getElementById('message').textContent = 'Login failed. Please check your credentials.';
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
});
