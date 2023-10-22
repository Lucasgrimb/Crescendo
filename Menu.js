document.addEventListener('DOMContentLoaded', function() {
    const checkbox = document.getElementById('checkbox');
    const menuContainer = document.querySelector('.menu-container');
    const closeIcon = document.querySelector('.close-icon');

    checkbox.addEventListener('change', function() {
        if (this.checked) {
            menuContainer.style.left = '0';
        } else {
            menuContainer.style.left = '-100%';
        }
    });
  
});


let valueDisplays = document.querySelectorAll(".num");
let interval = 2000; // Cambia el intervalo a 2 segundos (2000 ms)

// Obtén la referencia a la sección "Portfolio"
let section = document.querySelector(".Portfolio");

// Agrega una variable para rastrear si la animación ya ha comenzado
let started = false;

window.onscroll = function () {
    if (window.scrollY >= section.offsetTop) {
        if (!started) {
            valueDisplays.forEach((valueDisplay) => startCount(valueDisplay));
        }
        started = true;
    }
};

function startCount(valueDisplay) {
    let startValue = 0;
    let endValue = parseInt(valueDisplay.getAttribute("data-val"));
    let duration = Math.floor(interval / endValue);
    let counter = setInterval(function () {
        startValue += 1;
        valueDisplay.textContent = "+" + startValue; // Agrega el símbolo "+" al número
        if (startValue == endValue) {
            clearInterval(counter);
        }
    }, duration);
}





