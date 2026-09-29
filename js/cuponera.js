const listaCupones = [
    { id: 1, titulo: "Cena romántica", desc: "Elegimos el sitio que tú quieras." },
    { id: 2, titulo: "Masaje relajante", desc: "De 20 minutos con aceites." },
    { id: 3, titulo: "Película y palomitas", desc: "Tú mandas sobre la elección de la peli." },
    { id: 4, titulo: "Abrazo infinito", desc: "Canjeable en cualquier momento del día." },
    { id: 5, titulo: "Capricho dulce", desc: "Tu postre o antojo favorito invitado por mí." },
    { id: 6, titulo: "Paseo sin rumbo", desc: "Hacer lo que surja sin mirar el reloj." },
    { id: 7, titulo: "Elegir música", desc: "Veto total a mis canciones durante un viaje." },
    { id: 8, titulo: "Desayuno en la cama", desc: "Preparado con todo el amor del mundo." }
];

document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("cuponesGrid");
    
    // Recuperar los IDs de los cupones ya gastados del almacenamiento del navegador
    let cuponesGastados = JSON.parse(localStorage.getItem("cuponesGastados")) || [];

    function renderizarCupones() {
        grid.innerHTML = "";
        
        listaCupones.forEach(cupon => {
            const gastado = cuponesGastados.includes(cupon.id);

            const tarjeta = document.createElement("div");
            tarjeta.className = `tarjeta-cupon ${gastado ? 'gastado' : ''}`;

            tarjeta.innerHTML = `
                <span style="font-size: 1.8rem; margin-bottom: 8px;">🎟️</span>
                <h3 style="font-size: 0.9rem; font-weight: 600; margin-bottom: 4px; color: var(--accent-pink);">${cupon.titulo}</h3>
                <p style="font-size: 0.7rem; color: var(--texto-secundario); margin-bottom: 12px;">${cupon.desc}</p>
                <button class="btn-canjear" data-id="${cupon.id}" ${gastado ? 'disabled' : ''}>
                    ${gastado ? 'Gastado ✖' : 'Canjear 💖'}
                </button>
            `;

            grid.appendChild(tarjeta);
        });

        // Escuchar clics en los botones de los cupones activos
        document.querySelectorAll(".btn-canjear:not([disabled])").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = parseInt(e.target.getAttribute("data-id"));
                if (!cuponesGastados.includes(id)) {
                    cuponesGastados.push(id);
                    // Guardar en el navegador para que no se pierda al recargar
                    localStorage.setItem("cuponesGastados", JSON.stringify(cuponesGastados));
                    renderizarCupones(); // Volver a pintar la pantalla
                }
            });
        });
    }

    renderizarCupones();
});