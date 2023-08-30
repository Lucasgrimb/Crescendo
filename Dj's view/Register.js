var usernameValue = document.getElementById('username').value;
var passwordValue = document.getElementById('password').value;



function registerUser() {
    // Validar que los campos no estén vacíos
    if (username === "" || password === "") {
        alert("Por favor, complete todos los campos.");
        return;
    }

    // Mostrar el mensaje de registro exitoso en una alerta
    const userData = {
        username: username,
        password: password,
    };

    const successMessage = document.getElementById("successMessage");
    successMessage.innerText = `¡Registro exitoso!\n\nNombre de usuario: ${userData.username}\nContraseña: ${userData.password}`;
    successMessage.style.display = "block";

    // // Limpiar los campos después de mostrar el mensajeg
    // document.getElementById("username").value = "";
    // document.getElementById("password").value = "";

    // Redirigir a la página "success.html"
    window.location.href = "Start Party.html";
}




// main.js

button.addEventListener('click', async function () {
    event.preventDefault();  // Prevenimos la recarga automática del formulario

    // Volver a poner los valores de los inputs ya que cambiaron de lo que eran inicialmente
    usernameValue = document.getElementById('username').value;
    passwordValue = document.getElementById('password').value;
    // Crea el objeto loginData con los valores ingresados
    const loginData = {
      userName: usernameValue,
      password: passwordValue
  };

    // Mostrar el objeto loginData en la consola
    console.log(loginData); 

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData),
            credentials: "include",
        });

        const responseData = await response.json();
        console.log(responseData);  // Log the response data

        if (responseData.ok) {
            // Successful login
            document.getElementById('message').textContent = 'register successful';
        } else {
            // Failed login
            document.getElementById('message').textContent = 'Register failed. Please check your credentials.';
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
});

