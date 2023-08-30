const title = document.querySelector('.header-gradient');
const description = document.querySelector('.color-gray');
const form = document.querySelector('form');
const button = document.querySelector('.login-cta');
const nav = document.querySelector('.nav');


document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('button'); // Asegúrate de que este ID exista en tu botón HTML

  button.addEventListener('click', async function(event) {
      event.preventDefault();  // Prevenimos la recarga automática del formulario

      const usernameValue = document.getElementById('username').value;
      const passwordValue = document.getElementById('password').value;

      // Validación básica para asegurarse de que los campos no estén vacíos
      if (usernameValue === "" || passwordValue === "") {
          alert("Por favor, complete todos los campos.");
          return;
      }

      // Crear el objeto loginData con los valores ingresados
      const loginData = {
          username: usernameValue,
          password: passwordValue
      };

      // Mostrar el objeto loginData en la consola para depuración
      console.log(loginData);

      try {
          const response = await fetch('http://localhost:3000/api/register', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(loginData),
              credentials: 'include', // Incluye las cookies en la petición
          });

          const responseData = await response.json();
          console.log(responseData);  // Loguea los datos de la respuesta

          if (responseData.ok) {
              // Registro exitoso
              document.getElementById('message').textContent = 'Registro exitoso';
          } else {
              // Fallo en el registro
              document.getElementById('message').textContent = 'El registro falló. Verifique sus credenciales.';
          }
      } catch (error) {
          console.error('Error durante el registro:', error);
      }
  });
});
