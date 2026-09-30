// ================== CONFIGURACIÓN ==================
// ID de tu playlist: en Spotify -> Compartir -> Copiar enlace.
// El enlace es tipo open.spotify.com/playlist/ESTE_ES_EL_ID?si=...
const PLAYLIST_ID = "5Mp8ctWFk1O9lLlNg8BrNE";

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
const estadoTexto = document.getElementById("estadoTexto");
let sonando = false;
let apiLista = false;
let usandoFallback = false;

function setSonando(valor) {
    sonando = valor;
    escenario.classList.toggle("sonando", valor);
    estadoTexto.textContent = valor ? "Sonando… ♪" : "Dale al play y deja que suene ▶";
}

// ---------- Reproductor con la API de Spotify (detecta play/pausa) ----------
function cargarReproductorSimple() {
    if (usandoFallback || apiLista) return;
    usandoFallback = true;
    const cont = document.getElementById("spotify-player");
    const iframe = document.createElement("iframe");
    iframe.src = `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`;
    iframe.width = "100%";
    iframe.height = "352";
    iframe.frameBorder = "0";
    iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    iframe.loading = "lazy";
    cont.replaceWith(iframe);
    // Sin API no podemos saber si suena: dejamos las animaciones activas
    setSonando(true);
    estadoTexto.textContent = "♪ Nuestra música ♪";
}

window.onSpotifyIframeApiReady = (IFrameAPI) => {
    if (usandoFallback) return;
    apiLista = true;
    const elemento = document.getElementById("spotify-player");
    IFrameAPI.createController(
        elemento,
        { uri: `spotify:playlist:${PLAYLIST_ID}`, width: "100%", height: "352" },
        (controlador) => {
            controlador.addListener("playback_update", (e) => {
                const d = e.data || {};
                setSonando(!d.isPaused && !d.isBuffering);
            });
        }
    );
};

const scriptSpotify = document.createElement("script");
scriptSpotify.src = "https://open.spotify.com/embed/iframe-api/v1";
scriptSpotify.async = true;
scriptSpotify.onerror = cargarReproductorSimple;
document.body.appendChild(scriptSpotify);
setTimeout(cargarReproductorSimple, 5000); // por si la API tarda o falla

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