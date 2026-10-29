// ================== CONFIGURACIÓN ==================
const listaRazones = [
    "Por esa sonrisa que me alegra cada dia de mi vida ",
    "Por cada abrazo que me das y hace que mi mundo se tranquilice",
    "Por estar siempre junto a mi en los buenos y malos momentos",
    "Por esos dibujos que me haces y me hacen sentir tan especial",
    "Por esas llamadas que hacen que me sienta mucho mas cercad de ti",
    "Por cada te amo que me escribes y me hacen brillar los ojos",
    "Por esas tardes que parecen que pasan en segundos ",
    "Por esas miles de risas que me sacas cada vez que estoy junto a ti",
    "Por ser esa persona que podre decir en un futuro que sera mi mujer",
    "Por siempre preocuparte por mi y hacerme sentir que soy importante para ti",
];

const PAUSA_ENTRE_CARTAS = 800; // milisegundos entre una carta y la siguiente
const CLAVE = "razonesVistas";  // dónde se guardan las cartas ya descubiertas
const TIEMPO_GIRO = 700;        // lo que tarda la carta en darse la vuelta (igual que en razones.css)
// ===================================================

const grid = document.getElementById("razonesGrid");
const contador = document.getElementById("contadorRazones");

// ---------- Guardado de las cartas descubiertas ----------
function leerVistas() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE)) || [];
    } catch (e) {
        return [];
    }
}

function guardarVista(i) {
    try {
        const vistas = leerVistas();
        if (!vistas.includes(i)) {
            vistas.push(i);
            localStorage.setItem(CLAVE, JSON.stringify(vistas));
        }
    } catch (e) { /* si falla el guardado, no pasa nada */ }
}

// ---------- Contador ----------
function actualizarContador() {
    const total = listaRazones.length;
    const descubiertas = document.querySelectorAll(".carta-razon.girada").length;
    if (descubiertas === 0) {
        contador.textContent = "Toca una carta para darle la vuelta 💌";
    } else if (descubiertas < total) {
        contador.textContent = `Has descubierto ${descubiertas} de ${total}`;
    } else {
        contador.textContent = "Las has descubierto todas… y aun así podría seguir infinitamente 🤍";
    }
}

// ---------- Visor (ampliar una carta ya girada) ----------
let visor, visorNum, visorTexto;

function crearVisor() {
    visor = document.createElement("div");
    visor.className = "visor-razon";
    visor.innerHTML = `
        <button class="visor-razon-cerrar" aria-label="Cerrar">✕</button>
        <div class="carta-grande">
            <span class="frente-num"></span>
            <p class="frente-texto"></p>
            <span class="carta-corazon">🤍</span>
        </div>
    `;
    document.body.appendChild(visor);
    visorNum = visor.querySelector(".frente-num");
    visorTexto = visor.querySelector(".frente-texto");

    // Tocar en cualquier parte de la pantalla (o la X) cierra el visor
    visor.addEventListener("click", cerrarVisor);

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && visor.classList.contains("abierto")) cerrarVisor();
    });
}

function abrirVisor(i) {
    visorNum.textContent = `Razón ${i + 1}`;
    visorTexto.textContent = listaRazones[i];
    visor.classList.add("abierto");
    document.body.style.overflow = "hidden";
}

function cerrarVisor() {
    visor.classList.remove("abierto");
    document.body.style.overflow = "";
}

// ---------- Cartas ----------
function crearCarta(i, texto) {
    const carta = document.createElement("div");
    carta.className = "carta-razon";
    carta.innerHTML = `
        <div class="carta-interior">
            <div class="cara dorso">
                <span class="dorso-corazon">🤍</span>
                <span class="dorso-num">${i + 1}</span>
            </div>
            <div class="cara frente">
                <span class="frente-num">Razón ${i + 1}</span>
                <p class="frente-texto"></p>
            </div>
        </div>
    `;
    carta.querySelector(".frente-texto").textContent = texto;

    carta.addEventListener("click", () => {
        if (carta.dataset.girando) return;  // ignora toques mientras gira

        if (!carta.classList.contains("girada")) {
            carta.classList.add("girada");   // da la vuelta...
            guardarVista(i);
            actualizarContador();

            // ...y en cuanto termina el giro, se amplía sola
            const sinAnimacion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            carta.dataset.girando = "1";
            setTimeout(() => {
                delete carta.dataset.girando;
                abrirVisor(i);
            }, sinAnimacion ? 0 : TIEMPO_GIRO);
        } else {
            abrirVisor(i);                   // ya girada: se amplía directamente
        }
    });

    return carta;
}

// ---------- Aparición una a una ----------
const cola = [];
let procesando = false;

function encolar(carta) {
    cola.push(carta);
    if (!procesando) siguienteDeLaCola();
}

function siguienteDeLaCola() {
    if (cola.length === 0) {
        procesando = false;
        return;
    }
    procesando = true;
    cola.shift().classList.add("entrada");
    setTimeout(siguienteDeLaCola, PAUSA_ENTRE_CARTAS);
}

document.addEventListener("DOMContentLoaded", () => {
    crearVisor();

    const observador = new IntersectionObserver(entradas => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                encolar(entrada.target);
                observador.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.2 });

    const vistas = leerVistas();

    listaRazones.forEach((texto, i) => {
        const carta = crearCarta(i, texto);
        if (vistas.includes(i)) carta.classList.add("girada"); // las ya descubiertas salen giradas
        grid.appendChild(carta);
        observador.observe(carta);
    });

    actualizarContador();
});