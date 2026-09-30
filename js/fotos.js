// ================== CONFIGURACIÓN ==================
const CARPETA = "../fotos/";   // carpeta donde dejas las fotos
const EXTENSION = "jpg";       // todas las fotos deben tener esta extensión
const MAX_FOTOS = 60;          // límite de seguridad
const PAUSA_ENTRE_FOTOS = 700; // milisegundos entre una foto y la siguiente

// Frases opcionales: el número es el de la foto (1.jpg, 2.jpg...).
// Si una foto no tiene frase, sale sin texto.
const frases = {
    1: "Nuestro primer viaje juntos ✈️",
    2: "Una cena inolvidable 🍷",
    3: "Paseo al atardecer ✨",
    4: "Tarde de risas y pelis 🍿",
    5: "Mi sitio favorito del mundo: a tu lado 💖",
    6: "Por muchos momentos más así 🥂"
};
// ===================================================

const giros = [-3, 2, -1.5, 3, -2, 1.5]; // inclinación de cada polaroid

// ================== VISOR (AMPLIAR AL HACER CLIC) ==================
let visor, visorImg, visorPie;

function crearVisor() {
    visor = document.createElement("div");
    visor.className = "visor";
    visor.innerHTML = `
        <button class="visor-cerrar" aria-label="Cerrar">✕</button>
        <figure class="polaroid polaroid-grande revelada">
            <div class="foto-marco"><img alt=""></div>
            <figcaption></figcaption>
        </figure>
    `;
    document.body.appendChild(visor);
    visorImg = visor.querySelector("img");
    visorPie = visor.querySelector("figcaption");

    // Tocar en cualquier parte de la pantalla (o la X) cierra el visor
    visor.addEventListener("click", cerrarVisor);

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && visor.classList.contains("abierto")) cerrarVisor();
    });
}

function abrirVisor(n, url) {
    visorImg.src = url;
    visorPie.textContent = frases[n] || "";
    visor.classList.add("abierto");
    document.body.style.overflow = "hidden";
}

function cerrarVisor() {
    visor.classList.remove("abierto");
    document.body.style.overflow = "";
}
// ====================================================================

function existeFoto(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

function crearPolaroid(n, url) {
    const figura = document.createElement("figure");
    figura.className = "polaroid";
    figura.style.setProperty("--giro", giros[(n - 1) % giros.length] + "deg");

    const marco = document.createElement("div");
    marco.className = "foto-marco";

    const img = document.createElement("img");
    img.src = url;
    img.alt = "Recuerdo " + n;
    marco.appendChild(img);

    const pie = document.createElement("figcaption");
    pie.textContent = frases[n] || "";

    figura.appendChild(marco);
    figura.appendChild(pie);

    figura.addEventListener("click", () => abrirVisor(n, url));
    return figura;
}

// ================== APARICIÓN UNA A UNA ==================
const cola = [];
let procesando = false;

function encolar(polaroid) {
    cola.push(polaroid);
    if (!procesando) siguienteDeLaCola();
}

function siguienteDeLaCola() {
    if (cola.length === 0) {
        procesando = false;
        return;
    }
    procesando = true;
    const polaroid = cola.shift();
    polaroid.classList.add("entrada", "revelada"); // aparece y empieza a revelarse
    setTimeout(siguienteDeLaCola, PAUSA_ENTRE_FOTOS);
}
// =========================================================

document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("galeriaGrid");
    crearVisor();

    // Cada polaroid entra a la cola cuando aparece en pantalla
    const observador = new IntersectionObserver(entradas => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                encolar(entrada.target);
                observador.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.3 });

    let total = 0;
    for (let n = 1; n <= MAX_FOTOS; n++) {
        const url = `${CARPETA}${n}.${EXTENSION}`;
        if (!(await existeFoto(url))) break; // se para en la primera que no exista
        const polaroid = crearPolaroid(n, url);
        grid.appendChild(polaroid);
        observador.observe(polaroid);
        total++;
    }

    if (total === 0) {
        grid.innerHTML = '<p class="subtitulo">No encuentro fotos. Revisa que estén en la carpeta "fotos" como 1.jpg, 2.jpg...</p>';
    }
});