// ================== RECUERDOS (edita aquí) ==================
// Cada recuerdo es una polaroid. Las fotos van en la carpeta "fotos".
//   imagen: nombre del archivo
//   pie:    texto debajo de la foto
//   fecha:  sale arriba en la parte de atrás
//   texto:  lo que se lee al darle la vuelta
// ⚠️ Fechas y textos de atrás son de EJEMPLO: cámbialos por los tuyos.
const recuerdos = [
    {
        imagen: "1.jpg",
        pie: "25/06/2026",
        fecha: "3 de octubre de 2025",
        texto: "Aquel día supe que quería muchos viajes más contigo."
    },
    {
        imagen: "2.jpeg",
        pie: "Una cena inolvidable 🍷",
        fecha: "8/05/2026",
        texto: "No me acuerdo de lo que cenamos, solo de lo que me reí contigo."
    },
    {
        imagen: "3.jpeg",
        pie: "Paseo al atardecer ✨",
        fecha: "9/05/2026",
        texto: "El cielo estaba precioso, pero yo solo te miraba a ti."
    },
    {
        imagen: "4.jpeg",
        pie: "Tarde de risas y pelis 🍿",
        fecha: "17/04/2025",
        texto: "Mi plan favorito: cualquiera, si es contigo."
    },
    {
        imagen: "5.jpeg",
        pie: "Nuestro primer viaje juntos ✈️",
        fecha: "8/06/2025",
        texto: "Aquel día supe que quería muchos viajes más contigo."
    },
    {
        imagen: "6.jpeg",
        pie: "Una cena inolvidable 🍷",
        fecha: "26/06/2026",
        texto: "No me acuerdo de lo que cenamos, solo de lo que me reí contigo."
    },
    {
        imagen: "7.jpeg",
        pie: "Paseo al atardecer ✨",
        fecha: "29/06/2026",
        texto: "El cielo estaba precioso, pero yo solo te miraba a ti."
    },
    {
        imagen: "8.jpeg",
        pie: "Tarde de risas y pelis 🍿",
        fecha: "29/06/2026",
        texto: "Mi plan favorito: cualquiera, si es contigo."
    },
    {
        imagen: "9.jpeg",
        pie: "Paseo al atardecer ✨",
        fecha: "31/07/2026",
        texto: "El cielo estaba precioso, pero yo solo te miraba a ti."
    },
    {
        imagen: "10.jpeg",
        pie: "Paseo al atardecer ✨",
        fecha: "7/08/2026",
        texto: "El cielo estaba precioso, pero yo solo te miraba a ti."
    },
    {
        imagen: "11.jpeg",
        pie: "Paseo al atardecer ✨",
        fecha: "12/08/2026",
        texto: "El cielo estaba precioso, pero yo solo te miraba a ti."
    },
    {
        imagen: "12.jpeg",
        pie: "Paseo al atardecer ✨",
        fecha: "17/08/2026",
        texto: "El cielo estaba precioso, pero yo solo te miraba a ti."
    },
    {
        imagen: "13.jpeg",
        pie: "Paseo al atardecer ✨",
        fecha: "17/08/2026  ",
        texto: "El cielo estaba precioso, pero yo solo te miraba a ti."
    },
    {
        imagen: "14.jpeg",
        pie: "Paseo al atardecer ✨",
        fecha: "10 de noviembre de 2025",
        texto: "El cielo estaba precioso, pero yo solo te miraba a ti."
    },
    {
        imagen: "15.jpeg",
        pie: "Paseo al atardecer ✨",
        fecha: "10 de noviembre de 2025",
        texto: "El cielo estaba precioso, pero yo solo te miraba a ti."
    }
];

const CARPETA = "../fotos/";   // carpeta donde están las fotos
const PAUSA_ENTRE_FOTOS = 700; // milisegundos entre una foto y la siguiente
// ============================================================

// ================== AJUSTES DEL RASCA ==================
const RADIO_PINCEL = 20;        // px: tamaño del "dedo" que rasca
const PORCENTAJE_DESCUBIERTO = 0.5; // al llegar aquí, la capa se va sola
const MOVIMIENTO_MAXIMO_TOQUE = 8;  // px: si se mueve más, no cuenta como toque
const UMBRAL_DESLIZAR = 50;         // px: deslizamiento mínimo para pasar de foto en el visor
const DISTANCIA_AVISO_SCROLL = 80;  // px: al bajar esto, el aviso de "desliza" desaparece
const CLAVE_DESCUBIERTAS = "fotosDescubiertas";
const ESPERA_ANTES_DE_AMPLIAR = 800;  // ms: tras desvelar una foto, se amplía sola
const ESPERA_ANTES_DE_GIRAR = 3000;   // ms: la foto se ve de frente y luego se gira sola
// =======================================================

const giros = [-3, 2, -1.5, 3, -2, 1.5]; // inclinación de cada polaroid
const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ================== GUARDADO EN EL NAVEGADOR ==================
function leerDescubiertas() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_DESCUBIERTAS)) || [];
    } catch (e) {
        return [];
    }
}

function guardarDescubierta(imagen) {
    const lista = leerDescubiertas();
    if (lista.includes(imagen)) return;
    lista.push(imagen);
    try {
        localStorage.setItem(CLAVE_DESCUBIERTAS, JSON.stringify(lista));
    } catch (e) {
        // Si no deja guardar, al menos sigue descubierta hasta recargar
    }
}

function volverATapar() {
    try {
        localStorage.removeItem(CLAVE_DESCUBIERTAS);
        localStorage.removeItem("fotosPistaVista"); // de una versión anterior
    } catch (e) {
        // sin acceso, no pasa nada
    }
    location.reload();
}
// ==============================================================

// ================== CAPA PARA RASCAR ==================
// Números "aleatorios" que salen siempre igual para la misma foto,
// así los brillos no cambian de sitio al redibujar.
function aleatorioFijo(semilla) {
    let s = semilla * 9301 + 49297;
    return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
}

function crearRasca(marco, indice, alDescubrir) {
    const canvas = document.createElement("canvas");
    canvas.className = "rasca";
    canvas.setAttribute("aria-label", "Rasca para descubrir la foto");
    marco.appendChild(canvas);

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const trazos = []; // cada trazo: lista de puntos en proporción (0 a 1), para redibujar
    let ancho = 0, alto = 0;
    let rascando = false;
    let terminado = false;
    let ultimaComprobacion = 0;

    function pintarCapa() {
        const azar = aleatorioFijo(indice + 1);
        ctx.globalCompositeOperation = "source-over";

        const fondo = ctx.createLinearGradient(0, 0, ancho, alto);
        fondo.addColorStop(0, "#cfe3f7");
        fondo.addColorStop(0.5, "#a9d1f5");
        fondo.addColorStop(1, "#cfe3f7");
        ctx.fillStyle = fondo;
        ctx.fillRect(0, 0, ancho, alto);

        // Puntitos blancos
        const cantidad = Math.round(ancho * alto / 900);
        for (let i = 0; i < cantidad; i++) {
            ctx.beginPath();
            ctx.arc(azar() * ancho, azar() * alto, 0.8 + azar() * 1.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.45 + azar() * 0.5})`;
            ctx.fill();
        }

        // Unos cuantos brillos de cuatro puntas
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        for (let i = 0; i < 7; i++) {
            const x = azar() * ancho, y = azar() * alto, t = 4 + azar() * 5;
            ctx.beginPath();
            ctx.moveTo(x, y - t);
            ctx.quadraticCurveTo(x, y, x + t, y);
            ctx.quadraticCurveTo(x, y, x, y + t);
            ctx.quadraticCurveTo(x, y, x - t, y);
            ctx.quadraticCurveTo(x, y, x, y - t);
            ctx.fill();
        }

        // Texto "Rasca aquí 🤍"
        const tamano = Math.max(16, Math.round(ancho * 0.09));
        ctx.font = `600 ${tamano}px Montserrat, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
        ctx.shadowBlur = 6;
        ctx.fillStyle = "#2f6db5";
        ctx.fillText("Rasca aquí 🤍", ancho / 2, alto / 2);
        ctx.shadowBlur = 0;
    }

    function pintarTrazo(trazo) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = RADIO_PINCEL * 2;
        ctx.beginPath();
        trazo.forEach((p, i) => {
            const x = p.x * ancho, y = p.y * alto;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        if (trazo.length === 1) {
            ctx.arc(trazo[0].x * ancho, trazo[0].y * alto, RADIO_PINCEL, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.stroke();
        }
    }

    // Ajusta el canvas al tamaño real de la foto y a la pantalla (nítido en móvil)
    function redibujar() {
        if (terminado) return;
        const dpr = window.devicePixelRatio || 1;
        ancho = marco.clientWidth;
        alto = marco.clientHeight;
        if (!ancho || !alto) return;
        canvas.width = Math.round(ancho * dpr);
        canvas.height = Math.round(alto * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        pintarCapa();
        trazos.forEach(pintarTrazo);
    }

    function porcentajeRascado() {
        const datos = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let vacios = 0, total = 0;
        // Se mira 1 de cada 8 píxeles: suficiente y mucho más rápido
        for (let i = 3; i < datos.length; i += 32) {
            total++;
            if (datos[i] < 128) vacios++;
        }
        return total ? vacios / total : 0;
    }

    function comprobar() {
        if (terminado || porcentajeRascado() < PORCENTAJE_DESCUBIERTO) return;
        terminado = true;
        rascando = false;
        observador.disconnect();
        canvas.classList.add("desvanece");
        // Cuando termina el fundido, el canvas desaparece del todo
        const quitar = () => canvas.remove();
        canvas.addEventListener("transitionend", quitar, { once: true });
        setTimeout(quitar, 1200); // por si el navegador no avisa
        alDescubrir();
    }

    // offsetX/offsetY ya tienen en cuenta la inclinación de la polaroid
    function punto(e) {
        return { x: e.offsetX / canvas.clientWidth, y: e.offsetY / canvas.clientHeight };
    }

    canvas.addEventListener("pointerdown", e => {
        if (terminado) return;
        rascando = true;
        canvas.setPointerCapture(e.pointerId);
        const trazo = [punto(e)];
        trazos.push(trazo);
        pintarTrazo(trazo);
    });

    canvas.addEventListener("pointermove", e => {
        if (!rascando) return;
        const trazo = trazos[trazos.length - 1];
        const anterior = trazo[trazo.length - 1];
        const actual = punto(e);
        trazo.push(actual);
        pintarTrazo([anterior, actual]);

        const ahora = performance.now();
        if (ahora - ultimaComprobacion > 150) {
            ultimaComprobacion = ahora;
            comprobar();
        }
    });

    const soltar = () => {
        if (!rascando) return;
        rascando = false;
        comprobar();
    };
    canvas.addEventListener("pointerup", soltar);
    canvas.addEventListener("pointercancel", soltar);

    // Redibuja si cambia el tamaño (girar el móvil, cambiar la ventana...)
    const observador = new ResizeObserver(redibujar);
    observador.observe(marco);
    window.addEventListener("resize", redibujar); // por si cambia devicePixelRatio (zoom)

    // Cuando llega la fuente de la página, vuelve a pintar el texto con ella
    if (document.fonts) document.fonts.ready.then(redibujar);
}

// Corazoncitos que suben desde la foto al descubrirla
function lanzarCorazones(elemento) {
    if (reducirMovimiento) return;
    const caja = elemento.getBoundingClientRect();

    for (let i = 0; i < 14; i++) {
        const c = document.createElement("span");
        c.className = "corazon-sube";
        c.textContent = i % 2 ? "🤍" : "💙";
        c.style.left = caja.left + caja.width * (0.15 + Math.random() * 0.7) + "px";
        c.style.top = caja.top + caja.height * (0.55 + Math.random() * 0.35) + "px";
        c.style.fontSize = 14 + Math.random() * 12 + "px";
        document.body.appendChild(c);

        const deriva = (Math.random() - 0.5) * 80;
        const subida = 120 + Math.random() * 120;
        c.animate([
            { transform: "translate(-50%, 0) scale(0.5)", opacity: 0 },
            { opacity: 1, offset: 0.2 },
            { transform: `translate(calc(-50% + ${deriva}px), -${subida}px) scale(1.1)`, opacity: 0 }
        ], {
            duration: 1300 + Math.random() * 700,
            delay: Math.random() * 300,
            easing: "cubic-bezier(0.2, 0.7, 0.3, 1)",
            fill: "both"
        }).onfinish = () => c.remove();
    }
}
// ======================================================

// ================== VISOR (POLAROID AMPLIADA QUE SE GIRA) ==================
let visor, visorTarjeta, visorInterior, visorImg, visorPie, visorFecha, visorTexto;
let temporizadorGiro = null; // giro automático pendiente (solo al desvelar una foto)
let visorPosicion, flechaAnterior, flechaSiguiente;
let polaroidAbierta = null;
let indiceAbierto = -1;
let animando = false;
const polaroids = []; // { figura, recuerdo } en el mismo orden que en la página

function crearVisor() {
    visor = document.createElement("div");
    visor.className = "visor";
    visor.hidden = true;
    visor.setAttribute("role", "dialog");
    visor.setAttribute("aria-modal", "true");
    visor.setAttribute("aria-label", "Foto ampliada");
    visor.innerHTML = `
        <button class="visor-flecha visor-flecha-anterior" type="button" aria-label="Foto anterior">‹</button>
        <button class="visor-flecha visor-flecha-siguiente" type="button" aria-label="Foto siguiente">›</button>
        <div class="visor-contenido">
            <div class="visor-tarjeta" tabindex="0" role="button" aria-label="Darle la vuelta a la foto">
                <div class="visor-interior">
                    <figure class="cara cara-frente">
                        <div class="visor-foto"><img alt=""></div>
                        <figcaption></figcaption>
                    </figure>
                    <div class="cara cara-atras">
                        <p class="atras-fecha"></p>
                        <p class="atras-texto"></p>
                        <span class="atras-corazon" aria-hidden="true">🤍</span>
                    </div>
                </div>
            </div>
            <p class="visor-posicion" aria-live="polite"></p>
            <button class="btn-cerrar-visor" type="button">Cerrar</button>
        </div>
    `;
    document.body.appendChild(visor);

    visorTarjeta = visor.querySelector(".visor-tarjeta");
    visorInterior = visor.querySelector(".visor-interior");
    visorImg = visor.querySelector(".visor-foto img");
    visorPie = visor.querySelector("figcaption");
    visorFecha = visor.querySelector(".atras-fecha");
    visorTexto = visor.querySelector(".atras-texto");
    visorPosicion = visor.querySelector(".visor-posicion");
    flechaAnterior = visor.querySelector(".visor-flecha-anterior");
    flechaSiguiente = visor.querySelector(".visor-flecha-siguiente");

    // Deslizar el dedo (o arrastrar el ratón) a los lados para cambiar de foto.
    // Si el dedo se ha movido, no cuenta como toque: así deslizar no gira la foto.
    let gesto = null;
    let ultimoDeslizamiento = 0;

    visor.addEventListener("pointerdown", e => {
        cancelarGiroAutomatico(); // si ella toca algo, se respeta lo que haga
        if (!e.isPrimary) return;
        gesto = { x: e.clientX, y: e.clientY, movido: false };
    });

    visor.addEventListener("pointermove", e => {
        if (!gesto || !e.isPrimary || gesto.movido) return;
        if (Math.hypot(e.clientX - gesto.x, e.clientY - gesto.y) > MOVIMIENTO_MAXIMO_TOQUE) {
            gesto.movido = true;
        }
    });

    visor.addEventListener("pointerup", e => {
        if (!gesto || !e.isPrimary) return;
        const dx = e.clientX - gesto.x;
        const dy = e.clientY - gesto.y;
        if (Math.hypot(dx, dy) > MOVIMIENTO_MAXIMO_TOQUE) gesto.movido = true;
        // Tiene que ser claramente horizontal (no un scroll vertical)
        if (Math.abs(dx) >= UMBRAL_DESLIZAR && Math.abs(dx) > Math.abs(dy) * 1.5) {
            ultimoDeslizamiento = performance.now();
            navegar(dx < 0 ? 1 : -1);
        }
    });

    visor.addEventListener("pointercancel", () => { gesto = null; });

    visor.addEventListener("click", e => {
        // e.detail === 0: "clic" desde el teclado, nunca es un deslizamiento
        const fueDeslizamiento = e.detail !== 0 &&
            ((gesto && gesto.movido) || performance.now() - ultimoDeslizamiento < 400);
        gesto = null;
        if (fueDeslizamiento || animando) return;

        if (flechaAnterior.contains(e.target)) {
            navegar(-1);
        } else if (flechaSiguiente.contains(e.target)) {
            navegar(1);
        } else if (visorTarjeta.contains(e.target)) {
            girar();
        } else if (!visorPosicion.contains(e.target)) {
            // El botón "Cerrar" o cualquier sitio fuera de la polaroid
            cerrarVisor();
        }
    });

    visorTarjeta.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            girar();
        }
    });

    document.addEventListener("keydown", e => {
        if (visor.hidden) return;
        cancelarGiroAutomatico();
        if (e.key === "Escape") {
            cerrarVisor();
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            navegar(-1);
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            navegar(1);
        }
    });
}

// Siguiente (paso 1) o anterior (paso -1) foto ya descubierta; -1 si no hay
function buscarDescubierta(desde, paso) {
    for (let i = desde + paso; i >= 0 && i < polaroids.length; i += paso) {
        if (polaroids[i].figura.classList.contains("descubierta")) return i;
    }
    return -1;
}

// Pone en el visor la foto número "indice"
function rellenarVisor(indice) {
    const { figura, recuerdo } = polaroids[indice];
    indiceAbierto = indice;
    polaroidAbierta = figura;

    visorImg.src = CARPETA + recuerdo.imagen;
    visorImg.alt = recuerdo.pie;
    visorPie.textContent = recuerdo.pie;
    visorFecha.textContent = recuerdo.fecha;
    visorTexto.textContent = recuerdo.texto;
    visorPosicion.textContent = `${indice + 1} / ${polaroids.length}`;

    flechaAnterior.disabled = buscarDescubierta(indice, -1) === -1;
    flechaSiguiente.disabled = buscarDescubierta(indice, 1) === -1;
    // Si el foco estaba en una flecha que ya no se puede usar, pasa a la foto
    if (document.activeElement && document.activeElement.disabled) {
        visorTarjeta.focus({ preventScroll: true });
    }
}

// Deja la polaroid del visor mirando hacia delante, sin animar el giro
function ponerDeFrente() {
    visorInterior.style.transition = "none";
    visorInterior.classList.remove("girada");
    void visorInterior.offsetWidth;
    visorInterior.style.transition = "";
    visorTarjeta.setAttribute("aria-label", "Darle la vuelta a la foto");
}

// Pasa a la foto anterior (-1) o siguiente (1) sin cerrar el visor
function navegar(paso) {
    if (animando || visor.hidden) return;
    const destino = buscarDescubierta(indiceAbierto, paso);
    if (destino === -1) {
        empujonFinal(paso);
        return;
    }

    const anterior = polaroidAbierta;
    const ocultaEnPagina = anterior.classList.contains("en-visor");
    animando = true;
    // Al pasar de foto: sin giro automático y sin botón (se gira tocando la polaroid)
    cancelarGiroAutomatico();

    // La actual sale hacia un lado...
    const salida = reducirMovimiento
        ? [{ opacity: 1 }, { opacity: 0 }]
        : [
            { transform: "none", opacity: 1 },
            { transform: `translateX(${-paso * 110}%) rotate(${-paso * 6}deg)`, opacity: 0 }
        ];
    const fuera = visorTarjeta.animate(salida, {
        duration: reducirMovimiento ? 150 : 260,
        easing: "cubic-bezier(0.4, 0, 1, 1)",
        fill: "forwards"
    });

    fuera.onfinish = () => {
        // ...se cambia la foto (siempre de frente)...
        ponerDeFrente();
        if (ocultaEnPagina) {
            anterior.classList.remove("en-visor");
            polaroids[destino].figura.classList.add("en-visor");
        }
        rellenarVisor(destino);

        // ...y la nueva entra por el otro lado cuando la imagen está lista
        const imagenLista = visorImg.decode ? visorImg.decode().catch(() => {}) : Promise.resolve();
        const esperaMaxima = new Promise(r => setTimeout(r, 400));
        Promise.race([imagenLista, esperaMaxima]).then(() => {
            const entrada = reducirMovimiento
                ? [{ opacity: 0 }, { opacity: 1 }]
                : [
                    { transform: `translateX(${paso * 110}%) rotate(${paso * 6}deg)`, opacity: 0 },
                    { transform: "none", opacity: 1 }
                ];
            fuera.cancel();
            visorTarjeta.animate(entrada, {
                duration: reducirMovimiento ? 150 : 320,
                easing: "cubic-bezier(0, 0, 0.2, 1)"
            }).onfinish = () => { animando = false; };
        });
    };
}

// No hay más fotos descubiertas hacia ese lado: un pequeño "rebote"
function empujonFinal(paso) {
    if (reducirMovimiento) return;
    animando = true;
    visorTarjeta.animate(
        [{ transform: "none" }, { transform: `translateX(${-paso * 14}px)` }, { transform: "none" }],
        { duration: 280, easing: "ease-out" }
    ).onfinish = () => { animando = false; };
}

function girar() {
    const girada = visorInterior.classList.toggle("girada");
    visorTarjeta.setAttribute("aria-label", girada ? "Volver a la foto" : "Darle la vuelta a la foto");
}

function cancelarGiroAutomatico() {
    clearTimeout(temporizadorGiro);
    temporizadorGiro = null;
}

// Primera vez que se desvela: foto de frente unos segundos y luego se gira sola
function programarGiroAutomatico(retraso) {
    cancelarGiroAutomatico();
    temporizadorGiro = setTimeout(() => {
        temporizadorGiro = null;
        if (visor.hidden || visorInterior.classList.contains("girada")) return;
        girar(); // con movimiento reducido, el CSS lo convierte en un fundido
    }, retraso);
}

// Transformación que lleva la polaroid grande a la posición de la pequeña
function desdeLaPequena(figura) {
    const origen = figura.getBoundingClientRect();
    const destino = visorTarjeta.getBoundingClientRect();
    const escala = origen.width / destino.width;
    const dx = origen.left + origen.width / 2 - (destino.left + destino.width / 2);
    const dy = origen.top + origen.height / 2 - (destino.top + destino.height / 2);
    const giro = getComputedStyle(figura).getPropertyValue("--giro").trim() || "0deg";
    return `translate(${dx}px, ${dy}px) scale(${escala}) rotate(${giro})`;
}

// recienDesvelada: se abre sola tras rascarla por primera vez
function abrirVisor(indice, recienDesvelada = false) {
    if (animando || !visor.hidden) return;
    const figura = polaroids[indice].figura;
    rellenarVisor(indice);
    if (recienDesvelada) {
        // Cuenta los segundos desde que la foto ya está en su sitio
        programarGiroAutomatico(ESPERA_ANTES_DE_GIRAR + (reducirMovimiento ? 0 : 450));
    }

    // Bloquea el scroll de la página de fondo
    document.documentElement.classList.add("sin-scroll");

    visor.hidden = false;
    void visor.offsetWidth;
    visor.classList.add("abierto");
    visorTarjeta.focus({ preventScroll: true });

    if (reducirMovimiento) return;

    // Sale volando desde donde estaba la polaroid pequeña
    animando = true;
    figura.classList.add("en-visor");
    visorTarjeta.animate(
        [{ transform: desdeLaPequena(figura) }, { transform: "none" }],
        { duration: 450, easing: "cubic-bezier(0.2, 0.8, 0.3, 1)" }
    ).onfinish = () => { animando = false; };
}

function cerrarVisor() {
    if (animando || visor.hidden) return;
    cancelarGiroAutomatico();
    const figura = polaroidAbierta;

    // Vuelve con la foto hacia delante, sin animar el giro
    ponerDeFrente();

    // Tras pasar fotos, la polaroid puede estar fuera de la pantalla
    const caja = figura.getBoundingClientRect();
    const margen = caja.height * 0.2;
    const seVe = caja.top >= -margen && caja.bottom <= window.innerHeight + margen;

    const terminar = () => {
        visor.hidden = true;
        animando = false;
        figura.classList.remove("en-visor");
        document.documentElement.classList.remove("sin-scroll");
        figura.focus({ preventScroll: true });
        // Lleva la página hasta la polaroid que estaba viendo
        if (!seVe) {
            figura.scrollIntoView({ behavior: reducirMovimiento ? "auto" : "smooth", block: "center" });
        }
        polaroidAbierta = null;
        indiceAbierto = -1;
    };

    visor.classList.remove("abierto");

    // Sin animación de vuelta: fundido y, si hace falta, scroll hasta la foto
    if (reducirMovimiento || !seVe) {
        animando = true;
        setTimeout(terminar, reducirMovimiento ? 200 : 300);
        return;
    }

    animando = true;
    const vuelta = visorTarjeta.animate(
        [{ transform: "none" }, { transform: desdeLaPequena(figura) }],
        { duration: 380, easing: "cubic-bezier(0.4, 0, 0.6, 1)", fill: "forwards" }
    );
    vuelta.onfinish = () => {
        terminar();
        vuelta.cancel(); // quita el "fill" para la próxima vez
    };
}
// ===========================================================================

function crearPolaroid(recuerdo, indice, descubierta) {
    const figura = document.createElement("figure");
    figura.className = "polaroid" + (descubierta ? " descubierta" : "");
    figura.style.setProperty("--giro-base", giros[indice % giros.length] + "deg");

    const marco = document.createElement("div");
    marco.className = "foto-marco";

    const img = document.createElement("img");
    img.src = CARPETA + recuerdo.imagen;
    img.alt = recuerdo.pie || "Recuerdo " + (indice + 1);
    marco.appendChild(img);

    // Mientras está tapada se ve la fecha; al descubrirla, el pie de foto
    const pie = document.createElement("figcaption");
    const pieFecha = document.createElement("span");
    pieFecha.className = "pie-fecha";
    pieFecha.textContent = recuerdo.fecha || "";
    const pieTexto = document.createElement("span");
    pieTexto.className = "pie-texto";
    pieTexto.textContent = recuerdo.pie || "";
    pie.append(pieFecha, pieTexto);

    figura.appendChild(marco);
    figura.appendChild(pie);

    function prepararParaAmpliar() {
        figura.classList.add("descubierta");
        figura.tabIndex = 0;
        figura.setAttribute("role", "button");
        figura.setAttribute("aria-label", "Ampliar: " + (recuerdo.pie || "recuerdo"));
    }

    if (descubierta) {
        prepararParaAmpliar();
    } else {
        crearRasca(marco, indice, () => {
            figura.classList.add("animar-pie"); // solo se anima al descubrirla ahora
            prepararParaAmpliar();
            guardarDescubierta(recuerdo.imagen);
            lanzarCorazones(marco);
            actualizarContador(true);
            // Se amplía sola para que vea que se puede ampliar y girar
            setTimeout(() => abrirVisor(indice, true), ESPERA_ANTES_DE_AMPLIAR);
        });
    }

    // Un "toque" solo cuenta si la foto ya estaba descubierta al empezar
    // y el dedo no se ha movido más de unos píxeles (así rascar no amplía)
    let inicio = null;
    figura.addEventListener("pointerdown", e => {
        inicio = { x: e.clientX, y: e.clientY, tapada: !figura.classList.contains("descubierta") };
    });

    figura.addEventListener("click", e => {
        if (!figura.classList.contains("descubierta")) return;
        if (inicio) {
            const movido = Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y);
            const tapada = inicio.tapada;
            inicio = null;
            if (tapada || movido > MOVIMIENTO_MAXIMO_TOQUE) return;
        }
        abrirVisor(indice);
    });

    figura.addEventListener("keydown", e => {
        if ((e.key === "Enter" || e.key === " ") && figura.classList.contains("descubierta")) {
            e.preventDefault();
            abrirVisor(indice);
        }
    });

    return figura;
}

// ================== CONTADOR DE RECUERDOS ==================
// "Has descubierto X de Y recuerdos"; con recienDescubierta el número hace "pop"
function actualizarContador(recienDescubierta) {
    const contador = document.getElementById("contadorRecuerdos");
    if (!contador) return;
    const total = polaroids.length;
    if (total === 0) {
        contador.hidden = true;
        return;
    }
    const vistas = polaroids.filter(p => p.figura.classList.contains("descubierta")).length;

    if (vistas === total) {
        const yaEstaba = contador.classList.contains("completo");
        contador.classList.add("completo");
        contador.innerHTML =
            '<span class="contador-corazon" aria-hidden="true">🤍</span> ' +
            '¡Has descubierto todos nuestros recuerdos! 💙 ' +
            '<span class="contador-corazon" aria-hidden="true">🤍</span>';
        if (recienDescubierta && !yaEstaba) {
            contador.classList.add("pop");
            lanzarCorazones(contador);
        }
    } else {
        contador.classList.remove("completo", "pop");
        contador.innerHTML =
            `Has descubierto <span class="contador-num${recienDescubierta ? " pop" : ""}">${vistas}</span> de ${total} recuerdos 🤍`;
    }
}
// ===========================================================

// ================== AVISO "DESLIZA PARA VER MÁS" ==================
// Solo sale si la página tiene scroll; al bajar un poco se va para siempre
function prepararAvisoScroll() {
    const aviso = document.getElementById("avisoScroll");
    if (!aviso) return;
    let retirado = false;

    const scrollMaximo = () => document.documentElement.scrollHeight - window.innerHeight;

    function retirar() {
        retirado = true;
        aviso.classList.remove("visible");
        window.removeEventListener("scroll", alHacerScroll);
        window.removeEventListener("resize", comprobar);
        window.removeEventListener("load", comprobar);
        setTimeout(() => aviso.remove(), 700);
    }

    function alHacerScroll() {
        if (retirado) return;
        // Si la página apenas tiene scroll, basta con bajar lo que se pueda
        const limite = Math.min(DISTANCIA_AVISO_SCROLL, scrollMaximo() * 0.6);
        if (window.scrollY > limite) retirar();
    }

    function comprobar() {
        if (retirado) return;
        aviso.classList.toggle("visible", scrollMaximo() > 20);
        alHacerScroll();
    }

    window.addEventListener("scroll", alHacerScroll, { passive: true });
    window.addEventListener("resize", comprobar);
    window.addEventListener("load", comprobar); // por si cambia el alto al cargar todo
    comprobar();
}
// ==================================================================

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

document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("galeriaGrid");
    crearVisor();

    document.getElementById("volverATapar").addEventListener("click", e => {
        e.preventDefault();
        volverATapar();
    });

    // Cada polaroid entra a la cola cuando aparece en pantalla
    const observador = new IntersectionObserver(entradas => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                encolar(entrada.target);
                observador.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.3 });

    const descubiertas = leerDescubiertas();
    recuerdos.forEach((recuerdo, i) => {
        const polaroid = crearPolaroid(recuerdo, i, descubiertas.includes(recuerdo.imagen));
        polaroids.push({ figura: polaroid, recuerdo });
        grid.appendChild(polaroid);
        observador.observe(polaroid);
    });

    if (recuerdos.length === 0) {
        grid.innerHTML = '<p class="subtitulo">Todavía no hay recuerdos. Añádelos en js/fotos.js.</p>';
    }

    actualizarContador(false);
    prepararAvisoScroll();
});
