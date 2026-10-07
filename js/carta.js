const mensajeCarta = `Mi amor lo primero de todo voy ha echar estos tres días mucho de menos sobretodo esos buenos días y buenas noches pero seguiré dándotelos aunque no los puedas ver , también felicidades por nuestros dos meses de los cuales quedan muchísimos más ( lee la carta ajajjajaja), te quiero decir también que espero que disfrutes mucho con los chicos a las fiestas que vayáis también los dibujos que hagas y que  se solucione lo de la Peña lo antes posible, también disfruta mucho de las prefiestas bebé mucho y sobretodo ríete muchoooo, quiero decirte que voy a hacerte muchas fotos para enseñártelas y contarte las historias graciosas que me pasen , lo que te quiero decir también es que estos tres días se te van a pasar volando y en nada estamos en llamada y contándote historias graciosas.

TE QUIERO MUCHIMO Y ERES LA MEJOR DEL MUNDO MI RUBIA 🤍🤍🤍🤍🤍`;

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