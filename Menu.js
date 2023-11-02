document.addEventListener('DOMContentLoaded', function() {
    const checkbox = document.getElementById('checkbox');
    const menuContainer = document.querySelector('.menu-container');
    
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            menuContainer.style.left = '0';
        } else {
            menuContainer.style.left = '-100%';
        }
    });

    const valueDisplays = document.querySelectorAll(".num");
    const options = {
        root: null,
        rootMargin: "0px",
        threshold: 0.5
    };

    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const valueDisplay = entry.target;
                const value = valueDisplay.getAttribute("data-val");
                startCount(valueDisplay, value);
                observer.unobserve(valueDisplay);
            }
        });
    }, options);

    valueDisplays.forEach(valueDisplay => {
        observer.observe(valueDisplay);
    });

    function startCount(valueDisplay, value, isFirstNumber) {
        let startValue = 0;
        const duration = 800; // Duración en milisegundos
    
        function updateValue() {
            if (startValue <= parseInt(value)) {
                let displayedValue = "+" + startValue;
                
                if (value.endsWith("M")) {
                    // Si el valor termina con "M", añade "M" a la visualización
                    displayedValue += "M";
                }
    
                valueDisplay.textContent = displayedValue;
    
                startValue++;
                setTimeout(updateValue, duration / (parseInt(value) + 1));
            }
        }
    
        updateValue();
    }
    
    valueDisplays.forEach((valueDisplay, index) => {
        const isFirstNumber = index === 0;
        const value = valueDisplay.getAttribute("data-val");
        startCount(valueDisplay, value, isFirstNumber);
    });
    

    const ayudaLink = document.querySelector('a[href="#Portfolio"]');
    
    ayudaLink.addEventListener('click', (e) => {
        e.preventDefault();
        const portfolioSection = document.getElementById('Portfolio');
    
        portfolioSection.scrollIntoView({ behavior: 'smooth' });
    
        menuContainer.style.left = '-100%';
    });
});
