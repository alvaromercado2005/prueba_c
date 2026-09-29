// Lógica de cuenta atrás hacia el 11 de diciembre y textos dinámicos
function actualizarContador() {
    const ahora = new Date();
    let anioActual = ahora.getFullYear();
    let cumpleanos = new Date(anioActual, 11, 11); // 11 de Diciembre (Mes 11)
    let inicioAnio = new Date(anioActual, 0, 1);   // 1 de Enero

    // Si ya pasó el 11 de diciembre este año, apuntamos al año siguiente
    if (ahora > cumpleanos) {
        cumpleanos = new Date(anioActual + 1, 11, 11);
        inicioAnio = new Date(anioActual + 1, 0, 1);
    }

    // Cálculo del porcentaje de carga del año hacia el cumpleaños
    const totalTiempo = cumpleanos - inicioAnio;
    const tiempoTranscurrido = ahora - inicioAnio;
    
    let porcentaje = (tiempoTranscurrido / totalTiempo) * 100;
    if (porcentaje > 100) porcentaje = 100;
    if (porcentaje < 0) porcentaje = 0;

    // Actualizar ancho de la barra de carga y el texto de porcentaje
    const barraProgreso = document.getElementById('barraProgreso');
    const porcentajeTexto = document.getElementById('porcentajeTexto');
    
    if (barraProgreso) barraProgreso.style.width = porcentaje.toFixed(1) + '%';
    if (porcentajeTexto) porcentajeTexto.innerText = `loading ${porcentaje.toFixed(0)}%`;

    // Cálculo del tiempo exacto restante (días, horas, minutos, segundos)
    const diferencia = cumpleanos - ahora;
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

    // Pintar los números en el HTML asegurando el formato de 2 dígitos
    const elemDias = document.getElementById('dias');
    const elemHoras = document.getElementById('horas');
    const elemMinutos = document.getElementById('minutos');
    const elemSegundos = document.getElementById('segundos');

    if (elemDias) elemDias.innerText = String(dias).padStart(2, '0');
    if (elemHoras) elemHoras.innerText = String(horas).padStart(2, '0');
    if (elemMinutos) elemMinutos.innerText = String(minutos).padStart(2, '0');
    if (elemSegundos) elemSegundos.innerText = String(segundos).padStart(2, '0');

    // --- TEXTOS DINÁMICOS SEGÚN LOS DÍAS QUE FALTEN ---
    const textoDinamico = document.getElementById('mensajeDinamico');
    if (textoDinamico) {
        if (dias === 0 && horas === 0 && minutos === 0) {
            textoDinamico.innerText = "🎉 ¡Feliz cumpleaños, mi amor!";
        } else if (dias === 1) {
            textoDinamico.innerText = "✨ ¡Mañana es el gran día!";
        } else if (dias <= 7 && dias > 1) {
            textoDinamico.innerText = `⏳ ¡Solo quedan ${dias} días para tu gran día!`;
        } else if (dias <= 30) {
            textoDinamico.innerText = `💌 Queda menos de un mes para tu cumpleaños...`;
        } else {
            textoDinamico.innerText = `⏳ ¡Solo quedan ${dias} días!`;
        }
    }
}

// Ejecutar cada segundo
setInterval(actualizarContador, 1000);
actualizarContador();