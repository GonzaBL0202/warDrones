const API_URL = "http://localhost:8080";

        function getUserId() {
            return localStorage.getItem("userId");
        }

        const cont = document.getElementById("listaPartidas");
        const btnCargar = document.getElementById("btnCargar");

        let partidaSeleccionadaId = null;
        let ultimoBtnSeleccionado = null;

        function setCargarHabilitado(habilitado) {
            btnCargar.disabled = !habilitado;
            btnCargar.style.opacity = habilitado ? "1" : "0.6";
        }

        function seleccionarPartida(partidaId, btn) {
            partidaSeleccionadaId = partidaId;

            // “remarcar” selección (sin tocar CSS externo)
            if (ultimoBtnSeleccionado) {
                ultimoBtnSeleccionado.style.outline = "none";
                ultimoBtnSeleccionado.style.filter = "none";
            }
            btn.style.outline = "2px solid rgba(255,255,255,0.55)";
            btn.style.filter = "brightness(1.08)";
            ultimoBtnSeleccionado = btn;

            setCargarHabilitado(true);
        }

        async function cargarPartidas() {
            const userId = getUserId();
            if (!userId) {
                cont.innerHTML = "<div style='text-align:center;'>Usuario no logueado.</div>";
                setCargarHabilitado(false);
                return;
            }

            try {
                
                const response = await fetch(`${API_URL}/partida/cargar/${userId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });

                if (!response.ok) {
                    const txt = await response.text();
                    cont.innerHTML = `<div style='text-align:center;'>Error al cargar partidas</div>`;
                    console.error("Backend:", txt);
                    setCargarHabilitado(false);
                    return;
                }

                const partidas = await response.json();

                cont.innerHTML = "";
                setCargarHabilitado(false);
                partidaSeleccionadaId = null;
                ultimoBtnSeleccionado = null;

                if (!Array.isArray(partidas) || partidas.length === 0) {
                    cont.innerHTML = "<div style='text-align:center;'>No hay partidas guardadas</div>";
                    return;
                }

                partidas.forEach(p => {
                    const id = p.partidaId ?? p.id;

                    const btn = document.createElement("button");
                    btn.className = "boton";
                    btn.type = "button";
                    btn.style.width = "100%";
                    btn.style.height = "42px";

                    btn.innerHTML = `<span class="jacquard-12-regular">Partida #${id}</span>`;

                    btn.addEventListener("click", () => seleccionarPartida(id, btn));

                    cont.appendChild(btn);
                });

            } catch (error) {
                console.error("Error:", error);
                cont.innerHTML = "<div style='text-align:center;'>Error al cargar partidas</div>";
                setCargarHabilitado(false);
            }
        }

        btnCargar.addEventListener("click", () => {
            if (!partidaSeleccionadaId) return;

            localStorage.setItem("partidaId", String(partidaSeleccionadaId));
            window.location.href = "lobby.html";
        });

        cargarPartidas();