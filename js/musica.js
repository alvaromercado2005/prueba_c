// ================== CONFIGURACIÓN ==================
// Canciones del reproductor (en este orden). Para cada una:
//   titulo   -> nombre de la canción
//   artistas -> quién la canta
//   duracion -> lo que dura (se ve en la lista mientras carga el mp3)
//   audio    -> ruta al mp3, dentro de la carpeta regalos/canciones/
const CANCIONES = [
    { titulo: "WYA REMIX RED", artistas: "J Abdiel, De La Rose, Yan Block, iZaak, Jay Wheeler", duracion: "5:21", audio: "canciones/cancion1.mp3" },
    { titulo: "DURO", artistas: "Chris Jedi, Anuel AA, Gaby Music, Jamby \"La Sexy Voz\"", duracion: "3:38", audio: "canciones/cancion2.mp3" },
    { titulo: "ALMAS GEMELAS", artistas: "Myke Towers", duracion: "3:55", audio: "canciones/cancion3.mp3" },
    { titulo: "La 2blea", artistas: "Anuel AA", duracion: "5:25", audio: "canciones/cancion4.mp3" }
];

// Enlace de la playlist completa (botón "Escuchar en Spotify")
const PLAYLIST_URL = "https://open.spotify.com/playlist/5Mp8ctWFk1O9lLlNg8BrNE";

// Tus canciones especiales. Cambia los textos y añade o quita las que quieras.
// "especial: true" resalta la tuya (la de los dos).
const canciones = [
    { titulo: "Nuestra canción", artista: "Artista", historia: "La que sonaba cuando todo empezó, y todavía se me pone la piel de gallina.", especial: true },
    { titulo: "Título de la canción", artista: "Artista", historia: "La de aquel viaje en coche cantando a gritos sin saber la letra." },
    { titulo: "Título de la canción", artista: "Artista", historia: "La que pongo cuando te echo de menos." },
    { titulo: "Título de la canción", artista: "Artista", historia: "La de nuestro primer baile, aunque fuera en la cocina." }
];
// ===================================================

const escenario = document.getElementById("escenario");
let sonando = false;

// Activa/para el giro del vinilo, el brazo y las notas
function setSonando(valor) {
    sonando = valor;
    escenario.classList.toggle("sonando", valor);
}

// ---------- Reproductor propio ----------
const audio = new Audio();
audio.preload = "metadata";
let actual = 0;

const elemEstado = document.getElementById("bsEstado");
const elemTitulo = document.getElementById("bsTitulo");
const elemArtistas = document.getElementById("bsArtistas");
const elemDisco = document.getElementById("bsDiscoTitulo");
const elemProgreso = document.getElementById("bsProgreso");
const elemRelleno = document.getElementById("bsRelleno");
const elemActual = document.getElementById("bsActual");
const elemTotal = document.getElementById("bsTotal");
const elemError = document.getElementById("bsError");
const btnPlay = document.getElementById("bsPlay");
const elemLista = document.getElementById("bsLista");

document.getElementById("bsSpotify").href = PLAYLIST_URL;

function formatoTiempo(seg) {
    if (!isFinite(seg) || seg < 0) return "0:00";
    const m = Math.floor(seg / 60);
    const s = Math.floor(seg % 60);
    return m + ":" + String(s).padStart(2, "0");
}

// Lista de canciones
const pistas = CANCIONES.map((c, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "bs-pista";

    const num = document.createElement("span");
    num.className = "bs-num";
    num.textContent = i + 1;

    const info = document.createElement("span");
    info.className = "bs-pista-info";
    const t = document.createElement("span");
    t.className = "bs-pista-titulo";
    t.textContent = c.titulo;
    const a = document.createElement("span");
    a.className = "bs-pista-artistas";
    a.textContent = c.artistas;
    info.append(t, a);

    const dur = document.createElement("span");
    dur.className = "bs-dur";
    dur.textContent = c.duracion;

    const eq = document.createElement("span");
    eq.className = "bs-eq";
    eq.setAttribute("aria-hidden", "true");
    eq.innerHTML = "<span></span><span></span><span></span>";

    btn.append(num, info, dur, eq);
    btn.addEventListener("click", () => {
        if (i === actual) {
            alternar();
        } else {
            cargar(i);
            reproducir();
        }
    });
    li.appendChild(btn);
    elemLista.appendChild(li);
    return btn;
});

function mostrarError(texto) {
    elemError.textContent = texto || "";
}

function pintarEstado() {
    elemEstado.textContent = sonando ? "Sonando ahora" : "En pausa";
    btnPlay.classList.toggle("sonando", sonando);
    btnPlay.setAttribute("aria-label", sonando ? "Pausar" : "Reproducir");
    pistas.forEach((p, i) => {
        p.classList.toggle("activa", i === actual);
        p.classList.toggle("sonando", i === actual && sonando);
    });
}

function cargar(i) {
    actual = (i + CANCIONES.length) % CANCIONES.length;
    const c = CANCIONES[actual];
    mostrarError("");
    audio.src = c.audio;
    elemTitulo.textContent = c.titulo;
    elemArtistas.textContent = c.artistas;
    elemDisco.textContent = c.titulo;
    elemRelleno.style.width = "0%";
    elemActual.textContent = "0:00";
    elemTotal.textContent = c.duracion;
    pintarEstado();
}

function reproducir() {
    audio.play().catch(() => {
        // Si el archivo no existe, el evento "error" ya muestra el aviso
    });
}

function alternar() {
    if (audio.paused) reproducir();
    else audio.pause();
}

audio.addEventListener("play", () => { setSonando(true); pintarEstado(); });
audio.addEventListener("pause", () => { setSonando(false); pintarEstado(); });
audio.addEventListener("ended", () => { cargar(actual + 1); reproducir(); });
audio.addEventListener("error", () => {
    audio.pause();
    setSonando(false);
    pintarEstado();
    mostrarError("No encuentro el archivo de esta canción 🙈");
});
audio.addEventListener("loadedmetadata", () => {
    elemTotal.textContent = formatoTiempo(audio.duration);
});
audio.addEventListener("timeupdate", () => {
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    elemRelleno.style.width = pct + "%";
    elemProgreso.setAttribute("aria-valuenow", Math.round(pct));
    elemActual.textContent = formatoTiempo(audio.currentTime);
});

btnPlay.addEventListener("click", alternar);
document.getElementById("bsAnterior").addEventListener("click", () => {
    const seguir = !audio.paused;
    // Si ya lleva un rato, "anterior" vuelve al principio de la misma canción
    if (audio.currentTime > 3) audio.currentTime = 0;
    else cargar(actual - 1);
    if (seguir) reproducir();
});
document.getElementById("bsSiguiente").addEventListener("click", () => {
    const seguir = !audio.paused;
    cargar(actual + 1);
    if (seguir) reproducir();
});

// Clic en la barra: salta a ese punto
elemProgreso.addEventListener("click", (e) => {
    if (!audio.duration) return;
    const r = elemProgreso.getBoundingClientRect();
    audio.currentTime = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1) * audio.duration;
});
// Con el teclado: flechas para avanzar/retroceder 5 segundos
elemProgreso.addEventListener("keydown", (e) => {
    if (!audio.duration) return;
    if (e.key === "ArrowRight") audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
    if (e.key === "ArrowLeft") audio.currentTime = Math.max(audio.currentTime - 5, 0);
});

cargar(0);

// ---------- Notas musicales flotando ----------
const simbolos = ["♪", "♫", "♩", "♬", "💗"];

function lanzarNota() {
    const nota = document.createElement("span");
    nota.className = "nota-flotante";
    nota.textContent = simbolos[Math.floor(Math.random() * simbolos.length)];
    nota.style.left = Math.random() * 95 + "vw";
    nota.style.fontSize = (16 + Math.random() * 22) + "px";
    nota.style.animationDuration = (6 + Math.random() * 5) + "s";
    document.body.appendChild(nota);
    nota.addEventListener("animationend", () => nota.remove());
}

setInterval(() => { if (sonando) lanzarNota(); }, 900);   // más notas cuando suena
setInterval(() => { if (!sonando) lanzarNota(); }, 3500); // pocas cuando está en pausa

// ---------- Lista de canciones con historia ----------
const lista = document.getElementById("listaCanciones");
const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
            entrada.target.classList.add("vista");
            observador.unobserve(entrada.target);
        }
    });
}, { threshold: 0.2 });

canciones.forEach((c, i) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "cancion" + (c.especial ? " especial" : "");

    const num = document.createElement("div");
    num.className = "cancion-num";
    num.textContent = c.especial ? "♥" : i + 1;

    const info = document.createElement("div");
    info.className = "cancion-info";

    const titulo = document.createElement("h3");
    titulo.textContent = c.titulo;
    if (c.especial) {
        const etiqueta = document.createElement("span");
        etiqueta.className = "etiqueta-especial";
        etiqueta.textContent = "Nuestra";
        titulo.appendChild(etiqueta);
    }

    const artista = document.createElement("p");
    artista.className = "artista";
    artista.textContent = c.artista;

    const historia = document.createElement("p");
    historia.className = "historia";
    historia.textContent = c.historia;

    info.append(titulo, artista, historia);
    tarjeta.append(num, info);
    lista.appendChild(tarjeta);
    observador.observe(tarjeta);
});