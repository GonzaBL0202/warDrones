const API_URL = "http://localhost:8080";


function getUserId() {
    return localStorage.getItem("userId");
}

const cont = document.getElementById("listaPartidas");
const btnCargar = document.getElementById("btnCargar");

let partidaSeleccionadaId = null;
let ultimoBtnSeleccionado = null;
let partidaSeleccionadaEstado = null; // Corregido typo: Seleccionada

function setCargarHabilitado(habilitado) {
    btnCargar.disabled = !habilitado;
    btnCargar.style.opacity = habilitado ? "1" : "0.6";
}

function seleccionarPartida(partidaId, estado, fila) {
    partidaSeleccionadaId = partidaId;
    partidaSeleccionadaEstado = estado;

    if (ultimoBtnSeleccionado) {
        ultimoBtnSeleccionado.style.backgroundColor = "transparent";
        ultimoBtnSeleccionado.style.color = "white";
    }
    fila.style.backgroundColor = "rgba(255, 215, 0, 0.3)";
    fila.style.color = "#ffd700";
    fila.style.filter = "brightness(1.08)";

    ultimoBtnSeleccionado = fila;
    setCargarHabilitado(true);
}

async function cargarPartidas() {
    const userId = getUserId();
    if (!userId) {
        cont.innerHTML = "<tr><td colspan='3' style='padding:10px;'>Usuario no logueado.</td></tr>";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/partida/reanudables/${userId}`);
        if (!response.ok) throw new Error("Error en backend");

        const partidas = await response.json();
        cont.innerHTML = "";

        if (partidas.length === 0) {
            cont.innerHTML = "<tr><td colspan='3' style='padding:10px;'>No hay partidas guardadas</td></tr>";
            return;
        }
        console.log("Partida ejemplo:", partidas[0]);
        partidas.forEach(p => {
            const id = p.partidaId ?? p.id;
            const estado = p.partidaEstado ?? p.estado;
            
            const u1 = p.usuarioId1 ? `${p.usuarioId1.id} - ${p.usuarioId1.nombre}` : "-";
            const u2 = p.usuarioId2 ? `${p.usuarioId2.id} - ${p.usuarioId2.nombre}` : "-";
            const fila = document.createElement("tr");
            fila.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
            fila.innerHTML = `
                <td style="padding: 8px;">#${id}</td>
                <td style="padding: 8px;">${u1}</td>
                <td style="padding: 8px;">${u2}</td>
            `;

            fila.addEventListener("click", () => seleccionarPartida(id, estado, fila));
            cont.appendChild(fila);
        });

    } catch (error) {
        console.error(error);
        cont.innerHTML = "<tr><td colspan='3' style='padding:10px;'>Error al cargar datos</td></tr>";
    }
}

btnCargar.addEventListener("click", async () => {
    if (!partidaSeleccionadaId) return;

    const userId = getUserId(); // Definir userId aquí para usarlo en las peticiones
    localStorage.setItem("partidaId", String(partidaSeleccionadaId));

    const estadoSel = String(partidaSeleccionadaEstado || "").toUpperCase();

    // CASO JUGADOR 2: La partida ya está en espera (REANUDANDO)
    if (estadoSel === "REANUDANDO") {
        try {
            const res = await fetch(
                `${API_URL}/partida/reanudar/unirse/${partidaSeleccionadaId}?usuarioId=${userId}`,
                { method: "PUT" }
            );

            if (res.ok) {
                window.location.href = "partida.html"; // Va directo al juego
                return;
            } else {
                alert("La partida ya no está disponible o está llena.");
            }
        } catch (e) {
            console.error("Error al unirse:", e);
        }
    }
    // CASO JUGADOR 1: La partida está "GUARDADA" (o similar)
    else {
        try {
            const res = await fetch(`${API_URL}/partida/reanudar/${partidaSeleccionadaId}`, {
                method: "PUT"
            });

            if (res.ok) {
                window.location.href = "lobby.html"; // Va al lobby a esperar al otro
            } else {
                alert("No se pudo iniciar la reanudación.");
            }
        } catch (e) {
            console.error("Error al reanudar:", e);
        }
    }
});

cargarPartidas();