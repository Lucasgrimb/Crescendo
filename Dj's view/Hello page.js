const title = document.querySelector('.header-gradient');
const description = document.querySelector('.color-gray');
const form = document.querySelector('form');
const button = document.querySelector('.login-cta');
const nav = document.querySelector('.nav');
const usuario = document.getElementById("usuario");
const userName = document.getElementById("text-input");
const password = document.getElementById("tex1-input1");





// Animacion de entrada//
const animation = anime.timeline({
  easing: 'easeOutExpo',
  duration: 500,
});

animation
  .add({
    targets: nav,
    translateX: [-50, 0],
    opacity: [0, 1],
  })
  .add({
    targets: title,
    translateY: [-50, 0],
    opacity: [0, 1],
  })
  .add({
    targets: description,
    translateY: [20, 0],
    opacity: [0, 1],
  })
  .add({
    targets: form,
    translateY: [20, 0],
    opacity: [0, 1],
  })

// main.js

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




