const title = document.querySelector('.header-gradient');
const description = document.querySelector('.color-gray');
const form = document.querySelector('form');
const button = document.querySelector('.login-cta');
const nav = document.querySelector('.nav');

// Animación de entrada
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
  });

button.addEventListener('click', async function (event) {
  event.preventDefault(); // Prevenimos la recarga automática del formulario

  // Obtener los valores de los inputs
  let usernameValue = document.getElementById('username').value;
  let passwordValue = document.getElementById('password').value;

  // Crea el objeto loginData con los valores ingresados
  const loginData = {
    userName: usernameValue,
    password: passwordValue,
  };

  // Mostrar el objeto loginData en la consola
  console.log(loginData);

  try {
    const response = await fetch('https://crescendoapi-pro.vercel.app/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to login: ${response.status}`);
    }

    const responseData = await response.json();
    console.log(responseData); // Log the response data

    // Almacenar tokens en localStorage
    localStorage.setItem('accessToken', responseData.accessToken);
    localStorage.setItem('refreshToken', responseData.refreshToken);

    // Login exitoso
    document.getElementById('message').textContent = 'Login successful!';
    setTimeout(function() {
      window.location.href = "Qr code.html";
    }, 100); // 700 milisegundos = 0.7 segundos

  } catch (error) {
    console.log(`Error during login: ${error}`);
    // Login fallido
    document.getElementById('message').textContent = 'Inicio de sesion fallido. Porfavor chequeee su informacion';
  }
});
