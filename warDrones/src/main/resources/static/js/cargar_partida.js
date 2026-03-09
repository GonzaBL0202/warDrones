const API_URL = "http://localhost:8080";

function getUserId() {
    return localStorage.getItem("userId");
}

// DOM
const cont = document.getElementById("listaPartidas");
const btnCargar = document.getElementById("btnCargar");
const btnEliminar = document.getElementById("btnEliminar");
const btnVolverMenu = document.getElementById("btnVolverMenu");

// Modal
const modalEliminar = document.getElementById("modalEliminar");
const modalEliminarTexto = document.getElementById("modalEliminarTexto");
const btnEliminarSi = document.getElementById("btnEliminarSi");
const btnEliminarNo = document.getElementById("btnEliminarNo");

// Estado selección
let partidaSeleccionadaId = null;
let partidaSeleccionadaEstado = null;
let filaSeleccionada = null;

// Utils botones
function setCargarHabilitado(habilitado) {
    btnCargar.disabled = !habilitado;
    btnCargar.style.opacity = habilitado ? "1" : "0.6";
}

function setEliminarHabilitado(habilitado) {
    btnEliminar.disabled = !habilitado;
    btnEliminar.style.opacity = habilitado ? "1" : "0.6";
}

// Modal
function abrirModalEliminar() {
    modalEliminarTexto.textContent = `¿Desea eliminar la partida #${partidaSeleccionadaId}?`;
    modalEliminar.classList.remove("oculto");
}

function cerrarModalEliminar() {
    modalEliminar.classList.add("oculto");
}

// Cerrar modal tocando afuera del cuadro
modalEliminar.addEventListener("click", (e) => {
    if (e.target === modalEliminar) cerrarModalEliminar();
});

// Selección de fila
function seleccionarPartida(id, estado, fila) {
    partidaSeleccionadaId = id;
    partidaSeleccionadaEstado = estado;

    // desmarcar la anterior
    if (filaSeleccionada) {
        filaSeleccionada.style.backgroundColor = "transparent";
        filaSeleccionada.style.color = "white";
        filaSeleccionada.style.filter = "none";
    }

    // marcar la nueva
    fila.style.backgroundColor = "rgba(255, 215, 0, 0.3)";
    fila.style.color = "#ffd700";
    fila.style.filter = "brightness(1.08)";
    filaSeleccionada = fila;

    setCargarHabilitado(true);

    const estadoSel = String(estado || "").toUpperCase();
    setEliminarHabilitado(estadoSel === "GUARDADA");
}

// Cargar partidas
async function cargarPartidas() {
    const userId = getUserId();

    // reset selección y botones
    partidaSeleccionadaId = null;
    partidaSeleccionadaEstado = null;
    filaSeleccionada = null;
    setCargarHabilitado(false);
    setEliminarHabilitado(false);

    if (!userId) {
        cont.innerHTML =
            "<tr><td colspan='3' style='padding:10px;'>Usuario no logueado.</td></tr>";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/partida/reanudables/${encodeURIComponent(userId)}`);
        if (!response.ok) throw new Error("Error en backend");

        const partidas = await response.json();
        cont.innerHTML = "";

        if (!Array.isArray(partidas) || partidas.length === 0) {
            cont.innerHTML =
                "<tr><td colspan='3' style='padding:10px;'>No hay partidas guardadas</td></tr>";

            mostrarModoSinPartidas();
            return;
        }

        mostrarModoConPartidas();

        partidas.forEach((p) => {
            const id = p.partidaId ?? p.id;
            const estado = p.partidaEstado ?? p.estado;

            const u1 = p.usuarioId1 ? `${p.usuarioId1.id} - ${p.usuarioId1.nombre}` : "-";
            const u2 = p.usuarioId2 ? `${p.usuarioId2.id} - ${p.usuarioId2.nombre}` : "-";

            const fila = document.createElement("tr");
            fila.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
            fila.style.cursor = "pointer";

            fila.innerHTML = `
        <td style="padding: 8px;">#${id}</td>
        <td style="padding: 8px;">${u1}</td>
        <td style="padding: 8px;">${u2}</td>`;

            fila.addEventListener("click", () => seleccionarPartida(id, estado, fila));
            cont.appendChild(fila);
        });
    } catch (error) {
        console.error(error);
        cont.innerHTML =
            "<tr><td colspan='3' style='padding:10px;'>Error al cargar datos</td></tr>";
    }
}

// BOTÓN CARGAR
btnCargar.addEventListener("click", async () => {
    // Si el botón está en modo CREAR
    if (btnCargar.textContent === "Crear Partida") {
        window.location.href = "crear-partida.html";
        return;
    }

    if (!partidaSeleccionadaId) return;

    const userId = getUserId();
    if (!userId) return;

    localStorage.setItem("partidaId", String(partidaSeleccionadaId));

    const estadoSel = String(partidaSeleccionadaEstado || "").toUpperCase();

    // JUGADOR 2: se une si está REANUDANDO
    if (estadoSel === "REANUDANDO") {
        try {
            const res = await fetch(
                `${API_URL}/partida/reanudar/unirse/${encodeURIComponent(partidaSeleccionadaId)}?usuarioId=${encodeURIComponent(userId)}`,
                { method: "PUT" }
            );

            if (res.ok) {
                window.location.href = "partida.html";
            } else {
                alert("La partida ya no está disponible o está llena.");
            }
        } catch (e) {
            console.error("Error al unirse:", e);
            alert("Error al unirse a la partida.");
        }
        return;
    }

    // JUGADOR 1: inicia reanudación si está GUARDADA
    try {
        const res = await fetch(
            `${API_URL}/partida/reanudar/${encodeURIComponent(partidaSeleccionadaId)}`,
            { method: "PUT" }
        );

        if (res.ok) {
            localStorage.setItem("reanudarIniciada", "true");
            localStorage.setItem("reanudarPartidaId", String(partidaSeleccionadaId));
            localStorage.setItem("lobbyModo", "reanudar");
            window.location.href = "lobby.html";
        } else {
            alert("No se pudo iniciar la reanudación.");
        }
    } catch (e) {
        console.error("Error al reanudar:", e);
        alert("Error al iniciar reanudación.");
    }
});

// BOTÓN ELIMINAR -> abre modal (solo si GUARDADA)
btnEliminar.addEventListener("click", () => {
    if (!partidaSeleccionadaId) return;

    const estadoSel = String(partidaSeleccionadaEstado || "").toUpperCase();
    if (estadoSel !== "GUARDADA") {
        alert("Solo se pueden eliminar partidas GUARDADAS.");
        return;
    }

    abrirModalEliminar();
});

// MODAL: NO
btnEliminarNo.addEventListener("click", cerrarModalEliminar);

// MODAL: SI -> elimina
btnEliminarSi.addEventListener("click", async () => {
    const userId = getUserId();
    if (!userId || !partidaSeleccionadaId) {
        cerrarModalEliminar();
        return;
    }

    try {
        const res = await fetch(
            `${API_URL}/partida/guardada/${encodeURIComponent(partidaSeleccionadaId)}?usuarioId=${encodeURIComponent(userId)}`,
            { method: "DELETE" }
        );

        cerrarModalEliminar();

        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            alert("No se pudo eliminar. " + txt);
            return;
        }

        await cargarPartidas();
    } catch (e) {
        console.error(e);
        cerrarModalEliminar();
        alert("Error eliminando la partida.");
    }
});

// INIT
cargarPartidas();

function mostrarModoConPartidas() {
    btnCargar.textContent = "Cargar";
    btnCargar.disabled = true;
    btnCargar.style.opacity = "0.6";
    btnCargar.style.display = "block";

    btnEliminar.textContent = "Eliminar";
    btnEliminar.disabled = true;
    btnEliminar.style.opacity = "0.6";
    btnEliminar.style.display = "block";

    if (btnVolverMenu) {
        btnVolverMenu.textContent = "Volver al Menu";
    }
}

function mostrarModoSinPartidas() {
    btnCargar.textContent = "Crear Partida";
    btnCargar.disabled = false;
    btnCargar.style.opacity = "1";
    btnCargar.style.display = "block";

    btnEliminar.disabled = true;
    btnEliminar.style.opacity = "0.6";
    btnEliminar.style.display = "none";

    if (btnVolverMenu) {
        btnVolverMenu.textContent = "Volver al Menu";
    }
}

Help.init({
    title: "Ayuda - Cargar Partida",
    items: [
        "Selecciona la partida que quieras cargar.",
        "Espera a que el otro jugador también cargue la partida.",
        "Recuerda que aparecen partidas previamente guardadas.",
        "Puedes eliminar partidas guardadas.",
        "Si no hay partidas guardadas, puedes crear una nueva partida."
    ]
});