// ==========================================================
// CUENTA ATRÁS, BARRA DE PROGRESO, BOTÓN BLOQUEADO Y FONDO
// Las fechas están en js/config.js (objeto CONFIG).
// Modo de prueba: abre index.html?test=10 y termina en 10 segundos.
// ==========================================================

// ==========================================================
// FRASES DEL DÍA
// Cada día sale una distinta según los días que faltan:
// FRASES[diasRestantes % FRASES.length]. Cambia sola a medianoche
// y, si hay menos frases que días, vuelven a empezar en bucle.
// Para añadir más, escribe otra línea entre comillas terminada en coma.
// ⚠️ Son frases de EJEMPLO: cámbialas por las tuyas.
// ==========================================================
const FRASES = [
    'Cada día contigo es mi parte favorita del día.',
    'Si pudiera elegir otra vez, te elegiría a ti. Siempre.',
    'Contigo hasta lo normal se vuelve especial.',
    'Eres mi casualidad más bonita.',
    'Mi sitio favorito del mundo es a tu lado.',
    'Gracias por hacerme reír incluso en los días grises.',
    'Me encanta la persona que soy cuando estoy contigo.',
    'No hay cuenta atrás más bonita que la que acaba en ti.',
    'Lo mejor que me ha pasado tiene tu nombre.',
    'Te quiero más que ayer y menos que mañana.'
];

// ==========================================================
// TEXTOS DE LA TRANSICIÓN (al pulsar "Abrir sorpresas" ya desbloqueado)
// ==========================================================
const TEXTO_TRANSICION_TITULO = 'Aquí están tus regalos,';
const TEXTO_TRANSICION_NOMBRE = 'Celia';          // sale en cursiva
const TEXTO_TRANSICION_EMOJI = '🤍';
const TEXTO_TRANSICION_SUBTITULO = 'Ábrelos poco a poco…';

const SEGUNDO = 1000;
const MINUTO = 60 * SEGUNDO;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Fechas (reales o de prueba) ---
let objetivo = new Date(CONFIG.fechaObjetivo).getTime();
let inicio = new Date(CONFIG.fechaInicio).getTime();

// Con ?reset en la URL se vuelven a cerrar los regalos del menú (para probar)
if (new URLSearchParams(location.search).has('reset')) {
    try { localStorage.removeItem('regalosAbiertos'); } catch (e) { /* sin acceso, no pasa nada */ }
}

const segundosPrueba = parseInt(new URLSearchParams(location.search).get('test'), 10);
const modoPrueba = segundosPrueba > 0;

if (modoPrueba) {
    // La barra empieza en el porcentaje real y llega al 100% justo al terminar
    const ahora = Date.now();
    const progresoReal = Math.min(Math.max((ahora - inicio) / (objetivo - inicio), 0), 0.99);
    objetivo = ahora + segundosPrueba * SEGUNDO;
    inicio = objetivo - (objetivo - ahora) / (1 - progresoReal);
}

// --- Elementos ---
const elemTitulo = document.getElementById('tituloPrincipal');
const elemMensaje = document.getElementById('mensajeDinamico');
const elemBarra = document.getElementById('barraProgreso');
const elemPorcentaje = document.getElementById('porcentajeTexto');
const btnEntrar = document.getElementById('btnEntrar');
const btnCandado = document.getElementById('btnCandado');
const btnTexto = document.getElementById('btnTexto');
const elemMensajeBloqueo = document.getElementById('mensajeBloqueo');
const elemNota = document.getElementById('notaDesbloqueo');
const capaConfeti = document.getElementById('capaConfeti');
const elemFraseDia = document.getElementById('fraseDia');
const elemFraseTexto = document.getElementById('fraseTexto');

const numeros = {
    dias: document.getElementById('dias'),
    horas: document.getElementById('horas'),
    minutos: document.getElementById('minutos'),
    segundos: document.getElementById('segundos')
};

// "Se desbloquea el 11 de diciembre ✨" sacado de CONFIG
elemNota.textContent = 'Se desbloquea el ' + new Date(CONFIG.fechaObjetivo).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', timeZone: 'Europe/Madrid'
}) + ' ✨';

// ==========================================================
// CONTADOR
// ==========================================================
let desbloqueado = false;
let primeraVez = true;

function pintarNumero(elem, valor) {
    const texto = String(valor).padStart(2, '0');
    if (elem.textContent === texto) return;
    elem.textContent = texto;
    if (primeraVez || reducirMovimiento) return;
    // Reinicia la animación de "aparece desde arriba"
    elem.classList.remove('cambio');
    void elem.offsetWidth;
    elem.classList.add('cambio');
}

function pintarProgreso(fraccion) {
    const pct = Math.min(Math.max(fraccion, 0), 1) * 100;
    elemBarra.style.width = pct + '%';
    document.getElementById('runner').style.left = pct + '%';
    elemPorcentaje.textContent = `cargando amor… ${pct.toFixed(1)}%`;
}

// "Llevamos X días juntos" (días completos desde CONFIG.inicioRelacion)
const elemDiasJuntos = document.getElementById('diasJuntosTexto');
let ultimosDiasJuntos = null;

function actualizarDiasJuntos() {
    const juntos = Math.floor((Date.now() - CONFIG.inicioRelacion) / 86400000);
    if (juntos === ultimosDiasJuntos) return;
    ultimosDiasJuntos = juntos;
    elemDiasJuntos.innerHTML = `Llevamos <strong>${juntos}</strong> ${juntos === 1 ? 'día' : 'días'} juntos`;
}

function actualizarContador() {
    const ahora = Date.now();
    actualizarDiasJuntos();
    const diferencia = Math.max(objetivo - ahora, 0);

    pintarProgreso((ahora - inicio) / (objetivo - inicio));

    const dias = Math.floor(diferencia / DIA);
    pintarNumero(numeros.dias, dias);
    pintarNumero(numeros.horas, Math.floor((diferencia % DIA) / HORA));
    pintarNumero(numeros.minutos, Math.floor((diferencia % HORA) / MINUTO));
    pintarNumero(numeros.segundos, Math.floor((diferencia % MINUTO) / SEGUNDO));
    primeraVez = false;

    if (diferencia <= 0) {
        desbloquear();
        return;
    }

    elemFraseTexto.textContent = FRASES[dias % FRASES.length];
}

// ==========================================================
// BOTÓN: BLOQUEADO / DESBLOQUEADO
// ==========================================================
const MENSAJES_BLOQUEO = [
    'Paciencia, mi amor… aún no 🙈',
    'Sin trampas, ¿eh? 😌',
    'Lo bueno se hace esperar ✨',
    'Ni lo intentes, que te conozco 😏',
    'Cada segundo falta menos 🤍',
    'Todavía no… pero va a merecer la pena 💙'
];
let ultimoMensaje = -1;
let temporizadorMensaje = null;

function mostrarMensajeBloqueo() {
    // Elige uno al azar sin repetir el anterior
    let i;
    do {
        i = Math.floor(Math.random() * MENSAJES_BLOQUEO.length);
    } while (i === ultimoMensaje);
    ultimoMensaje = i;

    elemMensajeBloqueo.textContent = MENSAJES_BLOQUEO[i];
    elemMensajeBloqueo.classList.add('visible');
    clearTimeout(temporizadorMensaje);
    temporizadorMensaje = setTimeout(() => elemMensajeBloqueo.classList.remove('visible'), 2600);

    btnEntrar.classList.remove('tiembla');
    void btnEntrar.offsetWidth;
    btnEntrar.classList.add('tiembla');
}

btnEntrar.addEventListener('click', e => {
    e.preventDefault();

    if (!desbloqueado) {
        mostrarMensajeBloqueo();
        return;
    }

    if (transicionIniciada) return;
    if (modoPrueba) {
        try { sessionStorage.setItem(CLAVE_PRUEBA, '1'); } catch (err) { /* sin acceso, no pasa nada */ }
    }

    iniciarTransicion();
});

// ==========================================================
// TRANSICIÓN: FUNDIDO CON TEXTOS QUE LLEVA A MENU.HTML
// ==========================================================
let transicionIniciada = false;
let puedeSaltar = false;
let yendoAlMenu = false;

function irAlMenu() {
    if (yendoAlMenu) return;
    yendoAlMenu = true;
    location.href = CONFIG.paginaSorpresas;
}

function iniciarTransicion() {
    if (transicionIniciada) return;
    transicionIniciada = true;

    const capa = document.getElementById('transicion');
    const titulo = document.getElementById('transicionTitulo');
    const subtitulo = document.getElementById('transicionSubtitulo');

    // Título preparado palabra a palabra ("Celia" en cursiva)
    const palabras = TEXTO_TRANSICION_TITULO.split(' ').map(texto => ({ texto }));
    palabras.push({ texto: TEXTO_TRANSICION_NOMBRE, cursiva: true }, { texto: TEXTO_TRANSICION_EMOJI });
    titulo.innerHTML = '';
    const juntos = document.createElement('span'); // "Celia 🤍" nunca se separan de línea
    juntos.className = 'sin-corte';
    palabras.forEach((p, i) => {
        const span = document.createElement(p.cursiva ? 'em' : 'span');
        span.className = 'palabra';
        span.style.setProperty('--i', i);
        span.textContent = p.texto;
        if (i >= palabras.length - 2) {
            juntos.append(span, ' ');
        } else {
            titulo.append(span, ' ');
        }
    });
    titulo.append(juntos);
    subtitulo.querySelector('span').textContent = TEXTO_TRANSICION_SUBTITULO;

    // Tocar la pantalla solo sirve para saltar al menú a partir del final
    capa.addEventListener('click', () => { if (puedeSaltar) irAlMenu(); });

    capa.hidden = false;
    void capa.offsetWidth;
    capa.classList.add('visible');

    const fase = (clase, ms, alEmpezar) => setTimeout(() => {
        capa.classList.add(clase);
        if (alEmpezar) alEmpezar();
    }, ms);

    // Fundido, textos y redirección
    fase('fase-titulo', 600);
    fase('fase-subtitulo', 1800);
    fase('fase-final', 4000, () => { puedeSaltar = true; });
    setTimeout(irAlMenu, 4700);
}


function desbloquear() {
    if (desbloqueado) return;
    desbloqueado = true;
    clearInterval(intervalo);
    // El contador ya no corre, pero "Llevamos X días juntos" sigue cambiando a medianoche
    setInterval(actualizarDiasJuntos, MINUTO);

    btnEntrar.classList.remove('bloqueado', 'tiembla');
    btnEntrar.classList.add('desbloqueado');
    btnEntrar.removeAttribute('aria-disabled');
    btnCandado.remove();
    btnTexto.textContent = 'Abrir sorpresas 💙';

    elemMensajeBloqueo.classList.remove('visible');
    elemNota.classList.add('escondida');

    // La frase del día se despide con un fundido y deja de ocupar sitio
    elemFraseDia.classList.add('escondida');
    setTimeout(() => { elemFraseDia.hidden = true; }, 600);

    elemTitulo.textContent = '¡Llegó el día!';
    elemMensaje.textContent = 'Todo lo que viene ahora es para ti 🤍';
    elemMensaje.hidden = false;

    // Gran explosión desde el centro del título
    setTimeout(() => {
        const caja = elemTitulo.getBoundingClientRect();
        explosion(caja.left + caja.width / 2, caja.top + caja.height / 2, 80, true);
    }, 300);
}

// ==========================================================
// EXPLOSIÓN DE CORAZONES Y CONFETI
// ==========================================================
const COLORES_CONFETI = ['#6cb4ee', '#2f6db5', '#1f3550', '#ffffff', '#cfe3f7'];
const CORAZONES = ['🤍', '💙'];

function explosion(x, y, cantidad, conConfeti) {
    if (reducirMovimiento) return;

    for (let i = 0; i < cantidad; i++) {
        const esConfeti = conConfeti && i % 2 === 0;
        const p = document.createElement('span');
        p.className = esConfeti ? 'particula-confeti' : 'particula-corazon';

        if (esConfeti) {
            p.style.background = COLORES_CONFETI[i % COLORES_CONFETI.length];
        } else {
            p.textContent = CORAZONES[Math.floor(Math.random() * CORAZONES.length)];
            p.style.fontSize = (14 + Math.random() * 14) + 'px';
        }
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        capaConfeti.appendChild(p);

        const angulo = Math.random() * Math.PI * 2;
        const fuerza = (conConfeti ? 140 : 70) + Math.random() * (conConfeti ? 220 : 90);
        const dx = Math.cos(angulo) * fuerza;
        const dy = Math.sin(angulo) * fuerza - 60;
        const giro = (Math.random() - 0.5) * 720;
        const duracion = 1200 + Math.random() * 1000;

        p.animate([
            { transform: 'translate(-50%, -50%) scale(0.4) rotate(0deg)', opacity: 1 },
            { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${giro / 2}deg)`, opacity: 1, offset: 0.55 },
            { transform: `translate(calc(-50% + ${dx * 1.15}px), calc(-50% + ${dy + 160}px)) scale(0.9) rotate(${giro}deg)`, opacity: 0 }
        ], { duration: duracion, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)', fill: 'forwards' })
            .onfinish = () => p.remove();
    }
}

// ==========================================================
// FONDO: DESTELLOS QUE SUBEN (CANVAS)
// ==========================================================
(function destellos() {
    const canvas = document.getElementById('fondoDestellos');
    const ctx = canvas.getContext('2d');
    let ancho, alto, puntos = [];

    function crearPunto(enCualquierAltura) {
        const blanco = Math.random() < 0.5;
        return {
            x: Math.random() * ancho,
            y: enCualquierAltura ? Math.random() * alto : alto + 10,
            r: 0.8 + Math.random() * 1.8,
            vy: 0.15 + Math.random() * 0.35,
            fase: Math.random() * Math.PI * 2,
            color: blanco ? '255, 255, 255' : (Math.random() < 0.6 ? '108, 180, 238' : '47, 109, 181'),
            blanco
        };
    }

    function ajustar() {
        const dpr = window.devicePixelRatio || 1;
        ancho = window.innerWidth;
        alto = window.innerHeight;
        canvas.width = ancho * dpr;
        canvas.height = alto * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const total = Math.round(Math.min(70, ancho * alto / 18000));
        puntos = Array.from({ length: total }, () => crearPunto(true));
        if (reducirMovimiento) dibujar(0);
    }

    function dibujar(t) {
        ctx.clearRect(0, 0, ancho, alto);
        for (const p of puntos) {
            const brillo = 0.45 + 0.4 * Math.sin(t / 700 + p.fase);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color}, ${brillo})`;
            // Halo azul suave para que los blancos se vean sobre el fondo claro
            ctx.shadowColor = p.blanco ? 'rgba(47, 109, 181, 0.45)' : `rgba(${p.color}, 0.6)`;
            ctx.shadowBlur = 6;
            ctx.fill();
        }
    }

    function animar(t) {
        for (let i = 0; i < puntos.length; i++) {
            const p = puntos[i];
            p.y -= p.vy;
            p.x += Math.sin(t / 2000 + p.fase) * 0.15;
            if (p.y < -10) puntos[i] = crearPunto(false);
        }
        dibujar(t);
        requestAnimationFrame(animar);
    }

    window.addEventListener('resize', ajustar);
    ajustar();
    if (!reducirMovimiento) requestAnimationFrame(animar);
})();

// ==========================================================
// FONDO: CORAZONES FLOTANTES
// ==========================================================
(function corazonesFlotantes() {
    if (reducirMovimiento) return;
    const capa = document.getElementById('capaCorazones');
    const MAXIMO = 10;

    function soltarCorazon() {
        if (capa.childElementCount < MAXIMO && !document.hidden) {
            const c = document.createElement('span');
            c.className = 'corazon-flotante';
            c.textContent = CORAZONES[Math.floor(Math.random() * CORAZONES.length)];
            c.style.left = (Math.random() * 96) + 'vw';
            c.style.fontSize = (14 + Math.random() * 12) + 'px';
            capa.appendChild(c);

            const deriva = (Math.random() - 0.5) * 120;
            const opacidad = 0.35 + Math.random() * 0.3;
            c.animate([
                { transform: 'translate(0, 0) rotate(0deg)', opacity: 0 },
                { opacity: opacidad, offset: 0.15 },
                { transform: `translate(${deriva / 2}px, -55vh) rotate(${deriva / 8}deg)`, opacity: opacidad, offset: 0.55 },
                { transform: `translate(${deriva}px, -115vh) rotate(${deriva / 4}deg)`, opacity: 0 }
            ], { duration: 10000 + Math.random() * 6000, easing: 'linear', fill: 'forwards' })
                .onfinish = () => c.remove();
        }
        setTimeout(soltarCorazon, 1800 + Math.random() * 2600);
    }

    setTimeout(soltarCorazon, 800);
})();

// ==========================================================
// ARRANQUE
// ==========================================================
const intervalo = setInterval(actualizarContador, 250);
actualizarContador();
