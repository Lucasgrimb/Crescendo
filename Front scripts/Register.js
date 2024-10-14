const button = document.querySelector('.login-cta');
const nav = document.querySelector('.nav');



// Initialize DOM elements
const registerForm = document.querySelector('#register-form');

// Event listener for form submit
registerForm.addEventListener('submit', async function(event) {
    event.preventDefault();  // Prevent form from auto-submitting

    // Get current input values
    const userName = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Validate input
    if (userName === "" || password === "") {  // Note the corrected variable name
        alert("Por favor, complete todos los campos.");
        return;
    }

    // Prepare data for sending
    const userData = {
        userName,
        password
    };

    // Debug log
    console.log(userData);

    try {
        // Send POST request to register
        const response = await fetch('https://crescendoapi-pro.vercel.app/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        // Parse and log the JSON response
        const responseData = await response.json();
        console.log(responseData);

        // Check for successful registration
        if (response.status === 200) {
            document.getElementById('message').textContent = 'Register successful!';
            setTimeout(function() {
                window.location.href = "index.html";
            }, 1000);  // 3000 milisegundos = 3 segundos
        } else {
            document.getElementById('message').textContent = 'Register failed. Please check your credentials.';
        }
    } catch (error) {
        console.error('Error during registration:', error);
        document.getElementById('message').textContent = 'An error occurred during registration.';
    }
});
