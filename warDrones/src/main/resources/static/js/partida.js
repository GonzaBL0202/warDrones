// =======================
// partida.js
// =======================

const API_URL = "http://localhost:8080";

//----------------------MAPA----------------------
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

const grid = 32;
const revealRadius = 4;

let cols = 0;
let rows = 0;
let discovered = [];
let player = { x: 0, y: 0 };

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);

    cols = Math.max(1, Math.floor(canvas.width / grid));
    rows = Math.max(1, Math.floor(canvas.height / grid));

    discovered = Array.from({ length: rows }, () => Array(cols).fill(false));

    player = {
        x: Math.floor(cols / 2),
        y: Math.floor(rows / 2)
    };

    revealAroundPlayer();
    drawScene();
}

function drawMap() {
    ctx.fillStyle = '#24323d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= canvas.width; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function revealAroundPlayer() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const dx = x - player.x;
            const dy = y - player.y;
            if ((dx * dx) + (dy * dy) <= revealRadius * revealRadius) {
                discovered[y][x] = true;
            }
        }
    }
}

function drawFog() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            ctx.fillStyle = discovered[y][x] ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.9)';
            ctx.fillRect(x * grid, y * grid, grid, grid);
        }
    }

    const px = (player.x + 0.5) * grid;
    const py = (player.y + 0.5) * grid;
    const radiusPx = revealRadius * grid;

    const gradient = ctx.createRadialGradient(px, py, 0, px, py, radiusPx);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(px, py, radiusPx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawPlayer() {
    const px = (player.x + 0.5) * grid;
    const py = (player.y + 0.5) * grid;
    const size = Math.max(10, Math.floor(grid * 0.35));

    ctx.fillStyle = '#f2cb67';
    ctx.beginPath();

    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
}

function drawScene() {
    drawMap();
    drawFog();
    drawPlayer();
}

function movePlayer(dx, dy) {
    const newX = Math.min(cols - 1, Math.max(0, player.x + dx));
    const newY = Math.min(rows - 1, Math.max(0, player.y + dy));

    if (newX === player.x && newY === player.y) {
        return;
    }

    player.x = newX;
    player.y = newY;
    revealAroundPlayer();
    drawScene();
}

function movePlayerTo(targetX, targetY) {
    const newX = Math.min(cols - 1, Math.max(0, targetX));
    const newY = Math.min(rows - 1, Math.max(0, targetY));

    if (!discovered[newY] || !discovered[newY][newX]) {
        return;
    }

    if (newX === player.x && newY === player.y) {
        return;
    }

    player.x = newX;
    player.y = newY;

    revealAroundPlayer();
    drawScene();
}

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / grid);
    const y = Math.floor((event.clientY - rect.top) / grid);
    movePlayerTo(x, y);
});

//-----------Modal Salir----------------
function abrirModalSalir() {
    document.getElementById('modalSalir').classList.add('active');
}

function cerrarModalSalir() {
    document.getElementById('modalSalir').classList.remove('active');
}

async function abandonarPartida() {
    const partidaId = localStorage.getItem("partidaId");
    console.log("Abandonar partida. partidaId:", partidaId);
    if (!partidaId) return;

    try {
        await fetch(`${API_URL}/partida/renunciar/${partidaId}`, { method: 'PUT' });
    } catch (error) {
        console.error("Error abandonando partida:", error);
        return;
    }

    cerrarModalSalir();
    window.location.href = 'menu.html';
}

async function guardarPartida() {
    const partidaId = localStorage.getItem("partidaId");
    console.log("Guardar partida. partidaId:", partidaId);
    if (!partidaId) return;

    try {
        await fetch(`${API_URL}/partida/guardar/${partidaId}`, { method: 'PUT' });
    } catch (error) {
        console.error("Error guardando partida:", error);
        return;
    }

    cerrarModalSalir();
    window.location.href = 'menu.html';
}

//boton que abre el modal
document.getElementById("btnSalir")?.addEventListener("click", abrirModalSalir);

//Botones del modal
document.getElementById("btnConfirmarSalir")?.addEventListener("click", abandonarPartida);

document.getElementById("btnGuardar")?.addEventListener("click", guardarPartida);

//Boton cancela/cerrar modal
document.getElementById("btnCancelar")?.addEventListener("click", cerrarModalSalir);

window.addEventListener('resize', resizeCanvas);
resizeCanvas();


//------------Logica de notificaciones----------------
const usuarioId = localStorage.getItem("userId");
const currentPartidaId = localStorage.getItem("partidaId");

if (usuarioId && currentPartidaId) {
    const eventSource = new EventSource(
        `${API_URL}/lobby/connect?usuarioId=${encodeURIComponent(usuarioId)}`
    );

    eventSource.addEventListener("partida-finalizada", (event) => {
        const pid = String(event.data);
        if (pid === String(currentPartidaId)) {
            eventSource.close();
            window.location.href = "menu.html";
        }
    });

    eventSource.addEventListener("partida-guardada", (event) => {
        const pid = String(event.data);
        if (pid === String(currentPartidaId)) {
            eventSource.close();
            window.location.href = "menu.html";
        }
    });

    eventSource.onerror = (error) => {
        console.warn("SSE cerrado/error:", error);
        eventSource.close();
    };
}