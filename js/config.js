// ==========================================================
// CONFIGURACIÓN COMPARTIDA (index.html y menu.html)
// Cambia aquí las fechas y se actualiza todo.
// ==========================================================
const CONFIG = {
    // Momento en que termina la cuenta atrás y se desbloquean las sorpresas.
    // Formato: AAAA-MM-DDTHH:MM:SS+zona  (España en invierno = +01:00)
    // ⚠️ TEMPORAL para pruebas. La fecha original es: '2026-12-11T00:00:00+01:00'
    fechaObjetivo: '2026-10-10T00:00:00+02:00',

    // Desde cuándo empieza a "cargarse" la barra de progreso.
    fechaInicio: '2026-01-01T00:00:00+01:00',

    // Día en que empezamos (para "Llevamos X días juntos").
    // En junio España va con horario de verano, por eso es +02:00.
    inicioRelacion: new Date('2026-06-29T00:00:00+02:00'),

    // Página a la que lleva el botón cuando ya está desbloqueado.
    paginaSorpresas: 'menu.html'
};

// Clave usada por el modo de prueba (?test=10) para dejar entrar a menu.html
// en esa misma pestaña sin que haya llegado la fecha de verdad.
const CLAVE_PRUEBA = 'sorpresaPruebaDesbloqueada';

// ¿Ya se puede entrar a las sorpresas?
function sorpresaDisponible() {
    if (Date.now() >= new Date(CONFIG.fechaObjetivo).getTime()) return true;
    try {
        return sessionStorage.getItem(CLAVE_PRUEBA) === '1';
    } catch (e) {
        return false;
    }
}
