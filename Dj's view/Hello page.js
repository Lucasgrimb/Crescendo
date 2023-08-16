// Selecciono los elementos que se animarán//
const title = document.querySelector('.header-gradient');
const description = document.querySelector('.color-gray');
const form = document.querySelector('form');
const button = document.querySelector('.login-cta');
const nav = document.querySelector('.nav')
const usuario = document.getElementById("usuario")
usuario.addEventListener("click", async (e)=> {
  const req = await fetch("")
})

// Configurar la animación//
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
;
