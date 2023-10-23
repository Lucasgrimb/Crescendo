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

// Agrega una variable para rastrear si la animación ya ha comenzado
let started = false;

window.onscroll = function () {
    if (!started) {
        valueDisplays.forEach((valueDisplay) => {
            // Verifica si el elemento num es visible en la ventana actual
            if (isElementInViewport(valueDisplay)) {
                // Inicia la animación solo para elementos visibles
                startCount(valueDisplay);
            }
        });
        started = true;
    }
};

function startCount(valueDisplay) {
    let startValue = 0;
    let endValue = parseInt(valueDisplay.getAttribute("data-val"));
    let duration = Math.floor(interval / endValue);
    let counter = setInterval(function () {
        startValue += 1;
        valueDisplay.textContent = "+" + startValue + "M"; // Agrega el símbolo "+" y "M" al número
        if (startValue == endValue) {
            clearInterval(counter);
        }
    }, duration);
}

function isElementInViewport(el) {
    let rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
