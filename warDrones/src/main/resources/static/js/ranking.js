const ENDPOINT = "/api/ranking/victorias?limit=200";

function getCurrentUsername() {
  const candidates = ["username", "usuario", "user", "usuarioNombre", "playerName"];
  for (const k of candidates) {
    const v = (localStorage.getItem(k) || sessionStorage.getItem(k) || "").trim();
    if (v) return v;
  }
  return "";
}

function makeRow({ puesto, nombre, victorias, medal, highlight, bold }) {
  const tr = document.createElement("tr");

  if (highlight) {
    // Resaltado estilo "selección" (lo maneja el CSS)
    tr.classList.add("selected");
  }

  if (bold) {
    tr.style.fontWeight = "bold";
  }

  tr.innerHTML = `
    <td>${medal ? medal + " " : ""}#${puesto}</td>
    <td>${nombre}</td>
    <td>${victorias}</td>
  `;

  return tr;
}

async function cargarRanking() {
  const res = await fetch(ENDPOINT, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("HTTP " + res.status);

  const jugadores = await res.json();

  const body = document.getElementById("rankingBody");
  const scrollBox = document.getElementById("rankingScroll");

  body.innerHTML = "";

  const currentUser = getCurrentUsername().trim().toLowerCase();

  let myRowEl = null;
  let iAmTop3 = false;

  jugadores.forEach((j, idx) => {
    const puesto = idx + 1;
    const nombre = j.nombre;
    const victorias = j.victorias;

    const isMe = currentUser && String(nombre || "").trim().toLowerCase() === currentUser;

    const medal = puesto === 1 ? "🥇" : puesto === 2 ? "🥈" : puesto === 3 ? "🥉" : "";

    // Resaltar SIEMPRE si soy yo
    const highlight = isMe;

    // Negrita solo para el usuario
    const bold = isMe;

    const row = makeRow({ puesto, nombre, victorias, medal, highlight, bold });

    body.appendChild(row);

    if (isMe) {
      if (puesto <= 3) iAmTop3 = true;
      myRowEl = row;
    }
  });

  // Solo scrollea si NO estoy en el top3 (si estoy top3 ya se ve arriba)
  if (myRowEl && scrollBox && !iAmTop3) {
    myRowEl.scrollIntoView({ block: "center" });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarRanking().catch((err) => console.error("Ranking error:", err));
});

Help.init({
  title: "Ayuda - Ranking",
  items: [
    "Aquí se muestran los mejores jugadores.",
    "El ranking se ordena según las victorias obtenidas.",
    "Tu posición se actualizará después de cada partida.",
    "Intentá mejorar tu posición ganando partidas.",
    "Recuerda que si abandonas, es una victoria para tu rival."
  ]
});