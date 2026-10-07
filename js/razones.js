// ================== CONFIGURACIÓN ==================
const listaRazones = [
    "Por cómo brillas cuando sonríes de verdad.",
    "Porque haces que los días grises se conviertan en los mejores.",
    "Por tu forma de escuchar y cuidarme siempre.",
    "Porque cada risa a tu lado es mi momento favorito del día.",
    "Porque eres mi refugio y mi paz en cualquier lugar.",
    "Por tu inteligencia y lo mucho que admiro todo lo que haces.",
    "Porque me motivas a ser mejor persona cada día.",
    "Porque a tu lado cualquier sitio se siente como en casa.",
    "Por la complicidad que tenemos con solo una mirada.",
    "Simplemente, porque eres el amor de mi vida."
];

const PAUSA_ENTRE_CARTAS = 180; // milisegundos entre una carta y la siguiente
const CLAVE = "razonesVistas";  // dónde se guardan las cartas ya descubiertas
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
        contador.textContent = "Las has descubierto todas… y aun así podría seguir infinitamente 💖";
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
            <span class="carta-corazon">💖</span>
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
                <span class="dorso-corazon">💖</span>
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
        if (!carta.classList.contains("girada")) {
            carta.classList.add("girada");   // primer toque: da la vuelta
            guardarVista(i);
            actualizarContador();
        } else {
            abrirVisor(i);                   // ya girada: se amplía
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