
        // Mostrar id
        const partidaId = localStorage.getItem("partidaId");
        document.getElementById("partidaIdTxt").textContent = partidaId || "-";

        // Animación puntitos
        let n = 0;
        setInterval(() => {
            n = (n + 1) % 4;
            document.getElementById("dots").textContent = ".".repeat(n);
        }, 400);

        // Cancelar (por ahora solo vuelve al menú)
        document.getElementById("btnCancelar").addEventListener("click", () => {
            window.location.href = "menu.html";
        });

        
        // Conectar SSE para esperar a que otro jugador se una
        (function () {
            const userId = localStorage.getItem("userId");
            if (!userId) return;

            // el endpoint espera el param 'usuarioId', pero la clave en localStorage se guarda como 'userId'
            const url = `/lobby/connect?usuarioId=${encodeURIComponent(userId)}`;
            const es = new EventSource(url);
            
            es.addEventListener('connected', () => {
                console.log('Lobby SSE conectado');
            });

            es.addEventListener('partida-start', (evt) => {
                const partidaId = evt.data;
                localStorage.setItem('partidaId', partidaId);
                // Redirigir a la página de partida
                window.location.href = 'partida.html';
            });

            es.onerror = (err) => {
                console.log('SSE cerrado.');//
                es.close();
            };
        })();