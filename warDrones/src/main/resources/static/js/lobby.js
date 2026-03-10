// lobby.js

// const API_URL = "http://localhost:8080";
const API_URL = window.location.origin;

// Mostrar id
const partidaIdTxt = document.getElementById("partidaIdTxt");
const partidaId = localStorage.getItem("partidaId");
partidaIdTxt.textContent = partidaId || "-";

// Animación puntitos
let n = 0;
setInterval(() => {
    n = (n + 1) % 4;
    const dots = document.getElementById("dots");
    if (dots) dots.textContent = ".".repeat(n);
}, 400);

// Cancelar (crear => borrar, reanudar => volver a GUARDADA)
document.getElementById("btnCancelar").addEventListener("click", async () => {
    const partidaId = localStorage.getItem("partidaId");
    const userId = localStorage.getItem("userId");
    const modo = (localStorage.getItem("lobbyModo") || "").toLowerCase(); // "crear" | "reanudar"

    if (!partidaId || !userId) {
        window.location.href = "/sections/menu.html";
        return;
    }

    try {
        if (modo === "crear") {
            // CREAR: eliminar partida (tu comportamiento actual)
            await fetch(
                `${API_URL}/partida/cancelar/${encodeURIComponent(partidaId)}?usuarioId=${encodeURIComponent(userId)}`,
                { method: "DELETE" }
            );
        } else {
            // REANUDAR (o modo ausente): rollback a GUARDADA (no borrar)
            await fetch(
                `${API_URL}/partida/reanudar/cancelar/${encodeURIComponent(partidaId)}?usuarioId=${encodeURIComponent(userId)}`,
                { method: "PUT" }
            );
        }
    } catch (e) {
        // Ignoramos errores para no trabar la UI; igual volvemos al menú.
    }

    localStorage.removeItem("partidaId");
    localStorage.removeItem("lobbyModo");
    window.location.href = "/sections/menu.html";
});

// Conectar SSE para esperar a que otro jugador se una
(function () {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    // el endpoint espera el param 'usuarioId', pero la clave en localStorage se guarda como 'userId'
    const url = `/lobby/connect?usuarioId=${encodeURIComponent(userId)}`;
    const es = new EventSource(url);

    es.addEventListener("connected", () => {
        console.log("Lobby SSE conectado");
    });

    es.addEventListener("partida-start", (evt) => {
        const partidaId = evt.data;
        localStorage.setItem("partidaId", partidaId);

        // Una vez que arranca, ya no tiene sentido el modo lobby
        localStorage.removeItem("lobbyModo");

        // Redirigir a la página de partida
        window.location.href = "partida.html";
    });

    es.onerror = (err) => {
        console.log("SSE cerrado.");
        es.close();
    };
})();