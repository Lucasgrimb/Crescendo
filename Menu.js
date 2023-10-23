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
let interval = 800; // Cambia el intervalo a 2 segundos (2000 ms)

// Variable para rastrear si la animación ya ha comenzado para cada elemento
let started = Array(valueDisplays.length).fill(false);

window.onscroll = function () {
    valueDisplays.forEach((valueDisplay, index) => {
        if (!started[index] && isElementInViewport(valueDisplay)) {
            if (index === 0) {
                // Si es el primer elemento, agrega "M"
                startCount(valueDisplay, index, true);
            } else {
                // Para los otros elementos, no agrega "M"
                startCount(valueDisplay, index, false);
            }
            started[index] = true;
        }
    });
};

function startCount(valueDisplay, index, addM) {
    let startValue = 0;
    let endValue = parseInt(valueDisplay.getAttribute("data-val"));
    let duration = Math.floor(interval / endValue);
    let counter = setInterval(function () {
        startValue += 1;
        if (addM) {
            valueDisplay.textContent = "+" + startValue + "M"; // Agrega el símbolo "+" y "M" al primer número
        } else {
            valueDisplay.textContent = "+" + startValue; // Solo agrega "+"
        }
        if (startValue == endValue) {
            clearInterval(counter);
        }
    }, duration);
}

function isElementInViewport(el) {
    let rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.bottom <= window.innerHeight
    );
}
