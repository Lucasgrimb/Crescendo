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
