const title = document.querySelector('.header-gradient');
const description = document.querySelector('.color-gray');
const form = document.querySelector('form');
const button = document.querySelector('.login-cta');
const nav = document.querySelector('.nav');
var usernameValue = document.getElementById('username').value;
var passwordValue = document.getElementById('password').value;



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
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData),
            credentials: "include",
        });

        const responseData = await response.json();
        console.log(responseData);  // Log the response data

        if (responseData.message) {
            // Successful login
            document.getElementById('message').textContent = 'Login successful!';
            setTimeout(function() {
              window.location.href = "http://localhost:5500/Dj's%20view/Qr%20code.html";
          }, 3000);  // 3000 milisegundos = 3 segundos
        } else {
            // Failed login
            document.getElementById('message').textContent = 'Login failed. Please check your credentials.';
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
});


