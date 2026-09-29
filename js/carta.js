const mensajeCarta = `Mi amor,

Desde el primer momento en que cruzamos caminos, supe que mi vida iba a cambiar para siempre. Cada día a tu lado es un regalo, una aventura y la prueba más bonita de lo que significa querer de verdad. 

Quería escribirte estas palabras para recordarte lo muchísimo que te amo, lo orgulloso que estoy de ti y lo feliz que me hace saber que compartimos este camino juntos. 

Feliz cumpleaños, mi vida. Esto es solo un pequeño detalle de todo lo que te mereces hoy y siempre.

Te quiero con todo mi corazón. 💖`;

document.addEventListener("DOMContentLoaded", () => {
    const elementoTexto = document.getElementById("textoCarta");
    const contenedorBtn = document.getElementById("btnVolver");
    let index = 0;
    const velocidad = 85; // Velocidad pausada estilo escritura a mano

    function escribirLetra() {
        if (index < mensajeCarta.length) {
            elementoTexto.innerHTML += mensajeCarta.charAt(index);
            index++;
            setTimeout(escribirLetra, velocidad);
        } else {
            // CUANDO TERMINA DE ESCRIBIR: Hacemos aparecer el botón suavemente
            if (contenedorBtn) {
                contenedorBtn.classList.remove("oculto");
                contenedorBtn.classList.add("visible");
            }
        }
    }

    // Retardo inicial antes de empezar
    setTimeout(escribirLetra, 800);
});