// Tema de ntfy.sh al que llegan los avisos de canje (cámbialo aquí)
const TEMA_NTFY = "vales-celia-5473sbkdd2";

// ==========================================================
// LISTA DE VALES (edita aquí títulos, descripciones y emojis)
// El que tiene "especial: true" sale dorado y con un cuadro para escribir.
// ==========================================================
const listaCupones = [
    { id: 1, emoji: "🍝", titulo: "Cena romántica", desc: "Cena en el restaurante que tú elijas." },
    { id: 2, emoji: "💆", titulo: "Masaje relajante", desc: "Masaje de 30 minutos." },
    { id: 3, emoji: "🍿", titulo: "Cine", desc: "Película que tú elijas y palomitas." },
    { id: 4, emoji: "🤗", titulo: "Abrazo infinito", desc: "Canjeable en cualquier momento del día." },
    { id: 5, emoji: "🍌", titulo: "Capricho dulce", desc: "Vale por una bolsa de plátanos." },
    { id: 6, emoji: "🦆", titulo: "Ir a ver los patos", desc: "Vamos a la Fuencisla o al pantano a ver los patos." },
    { id: 7, emoji: "🌅", titulo: "Atardecer en un sitio nuevo", desc: "Un lugar nuevo al que nunca hemos ido." },
    { id: 8, emoji: "🍳", titulo: "Te cocino yo", desc: "Te cocino lo que quieras." },
    { id: 9, emoji: "👑", titulo: "Vale por lo que tú quieras", desc: "Escribe aquí tu deseo y te lo concedo ✨", especial: true }
];

const CLAVE_CANJES = "valesCanjeados";
const CLAVE_DESEOS = "valesDeseos";

// Manda una notificación a ntfy.sh cuando se canjea un vale.
// Si es el vale especial, también manda el deseo que ha escrito.
// Si falla (sin internet, etc.), no pasa nada en la página.
function avisarCanje(titulo, deseo) {
    let mensaje = `🤍 ¡Ha canjeado: ${titulo}!`;
    if (deseo) mensaje += `\n✨ Su deseo: ${deseo}`;

    try {
        fetch(`https://ntfy.sh/${TEMA_NTFY}`, {
            method: "POST",
            body: mensaje,
            headers: {
                "Title": "Vale canjeado",
                "Tags": "white_heart"
            }
        }).catch(() => {});
    } catch (e) {
        // Navegadores sin fetch: se ignora
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const pantallaCarta = document.getElementById("pantallaCarta");
    const btnVerVales = document.getElementById("btnVerVales");
    const cuponera = document.getElementById("cuponera");
    const grid = document.getElementById("valesGrid");
    const contador = document.getElementById("contadorVales");

    const modal = document.getElementById("modalCanje");
    const modalEmoji = document.getElementById("modalEmoji");
    const modalTitulo = document.getElementById("modalTitulo");
    const modalDeseo = document.getElementById("modalDeseo");
    const btnConfirmar = document.getElementById("btnConfirmar");
    const btnCancelar = document.getElementById("btnCancelar");

    // ---------- Guardado en el navegador ----------
    // Formato: { "3": "2026-10-29T18:00:00.000Z", ... }
    function leerCanjes() {
        try {
            const guardado = JSON.parse(localStorage.getItem(CLAVE_CANJES));
            if (guardado) return guardado;

            // Vales gastados con la versión anterior (solo guardaba los ids)
            const antiguos = JSON.parse(localStorage.getItem("cuponesGastados")) || [];
            const canjes = {};
            antiguos.forEach(id => { canjes[id] = null; });
            return canjes;
        } catch (e) {
            return {};
        }
    }

    // Deseos escritos en el vale especial. Formato: { "9": "Un viaje a la playa" }
    function leerDeseos() {
        try {
            return JSON.parse(localStorage.getItem(CLAVE_DESEOS)) || {};
        } catch (e) {
            return {};
        }
    }

    function guardarCanjes() {
        try {
            localStorage.setItem(CLAVE_CANJES, JSON.stringify(canjes));
            localStorage.setItem(CLAVE_DESEOS, JSON.stringify(deseos));
        } catch (e) {
            // Si el navegador no deja guardar, al menos funciona hasta recargar
        }
    }

    let canjes = leerCanjes();
    let deseos = leerDeseos();

    // ---------- Pintar los vales ----------
    function formatearFecha(iso) {
        if (!iso) return "";
        return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
    }

    function actualizarContador() {
        const total = listaCupones.length;
        const quedan = listaCupones.filter(c => !(c.id in canjes)).length;

        if (quedan === 0) {
            contador.textContent = "¡Has usado todos tus vales! 🤍";
        } else {
            contador.innerHTML = `Te ${quedan === 1 ? "queda" : "quedan"} <strong>${quedan}</strong> de ${total} vales`;
        }
    }

    function marcarCanjeado(tarjeta, fecha, deseo) {
        tarjeta.classList.add("canjeado");
        const boton = tarjeta.querySelector(".btn-canjear");
        boton.disabled = true;
        boton.textContent = "Canjeado";
        tarjeta.querySelector(".vale-fecha").textContent = formatearFecha(fecha);

        // En el vale especial, el cuadro de texto se cambia por el deseo enviado
        const campo = tarjeta.querySelector(".vale-campo");
        if (campo) {
            const textoDeseo = document.createElement("p");
            textoDeseo.className = "vale-deseo";
            textoDeseo.textContent = deseo ? `«${deseo}»` : "";
            campo.replaceWith(textoDeseo);
        }
    }

    listaCupones.forEach((cupon, i) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = `vale${cupon.especial ? " especial" : ""}`;
        tarjeta.style.setProperty("--i", i);
        tarjeta.dataset.id = cupon.id;

        tarjeta.innerHTML = `
            <div class="vale-ticket">
                <div class="vale-cuerpo">
                    <div class="vale-emoji">${cupon.emoji}</div>
                    <div class="vale-texto">
                        <h3>${cupon.titulo}</h3>
                        <p>${cupon.desc}</p>
                        ${cupon.especial ? `
                        <textarea class="vale-campo" rows="3" maxlength="200"
                            placeholder="¿Qué te apetece? Escríbelo aquí…" aria-label="Escribe tu deseo"></textarea>` : ""}
                        <button class="btn-canjear" type="button">${cupon.especial ? "Enviar mi deseo ✨" : "Canjear 🤍"}</button>
                    </div>
                </div>
                <div class="vale-talon">
                    <span>Nº ${String(cupon.id).padStart(3, "0")}</span>
                </div>
                <div class="vale-sello" aria-hidden="true">
                    CANJEADO 🤍
                    <small class="vale-fecha"></small>
                </div>
            </div>
        `;

        if (cupon.id in canjes) marcarCanjeado(tarjeta, canjes[cupon.id], deseos[cupon.id]);

        tarjeta.querySelector(".btn-canjear").addEventListener("click", () => {
            let deseo = "";
            const campo = tarjeta.querySelector(".vale-campo");

            // En el vale especial hay que escribir algo antes de enviarlo
            if (campo) {
                deseo = campo.value.trim();
                if (!deseo) {
                    campo.classList.remove("vacio");
                    void campo.offsetWidth; // para que la sacudida se repita
                    campo.classList.add("vacio");
                    campo.focus();
                    return;
                }
            }

            abrirModal(cupon, tarjeta, deseo);
        });

        const campo = tarjeta.querySelector(".vale-campo");
        if (campo) campo.addEventListener("animationend", () => campo.classList.remove("vacio"));
        grid.appendChild(tarjeta);
    });

    actualizarContador();

    // ---------- Modal de canje ----------
    let valePendiente = null;

    function abrirModal(cupon, tarjeta, deseo) {
        valePendiente = { cupon, tarjeta, deseo };
        modalEmoji.textContent = cupon.emoji;
        modalTitulo.textContent = cupon.titulo;
        modalDeseo.textContent = deseo ? `«${deseo}»` : "";
        modalDeseo.hidden = !deseo;
        modal.classList.toggle("especial", !!cupon.especial);
        modal.hidden = false;
        btnConfirmar.focus();
    }

    function cerrarModal() {
        modal.hidden = true;
        if (valePendiente) valePendiente.tarjeta.querySelector(".btn-canjear").focus();
        valePendiente = null;
    }

    function lanzarConfeti(dorado) {
        if (typeof confetti !== "function") return; // sin internet no hay confeti
        const colores = dorado
            ? ["#b8860b", "#d4a017", "#f5d76e", "#fff4cc", "#ffffff"]
            : ["#2f6db5", "#6cb4ee", "#a9d1f5", "#cfe3f7", "#ffffff"];
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: colores });
        setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0 }, colors: colores }), 200);
        setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1 }, colors: colores }), 350);
    }

    btnConfirmar.addEventListener("click", () => {
        if (!valePendiente) return;
        const { cupon, tarjeta, deseo } = valePendiente;
        const fecha = new Date().toISOString();

        canjes[cupon.id] = fecha;
        if (deseo) deseos[cupon.id] = deseo;
        guardarCanjes();

        tarjeta.classList.add("recien-canjeado");
        marcarCanjeado(tarjeta, fecha, deseo);
        actualizarContador();
        cerrarModal();
        lanzarConfeti(cupon.especial);
        avisarCanje(cupon.titulo, deseo);
    });

    btnCancelar.addEventListener("click", cerrarModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) cerrarModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.hidden) cerrarModal();
    });

    // ---------- Intro: carta → cuponera ----------
    btnVerVales.addEventListener("click", () => {
        pantallaCarta.classList.add("saliendo");
    });

    pantallaCarta.addEventListener("animationend", (e) => {
        if (e.target !== pantallaCarta || e.animationName !== "pantallaSale") return;
        pantallaCarta.hidden = true;
        document.body.classList.remove("intro");
        cuponera.classList.add("visible");
    });
});
