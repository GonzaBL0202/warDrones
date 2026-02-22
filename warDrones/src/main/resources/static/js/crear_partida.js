const API_URL = 'http://localhost:8080';
        const userId = localStorage.getItem('userId');

        document.getElementById('btnCancelar').onclick = () => {
            window.location.href = 'menu.html';
        };

        function getId() {
            const id = localStorage.getItem('userId');
            return id ? parseInt(id) : null;
        }
        document.getElementById('btnIniciar').addEventListener('click', async () => {
            if (!userId) {
                alert('Usuario no logueado.');
                window.location.href = '../index.html';
                return;
            }

            try{
                const response = await fetch(`${API_URL}/partidas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuarioId: userId })
            });

            if (!response.ok) {
                const txt = await response.text();
                console.error('Error al crear partida:', txt);
                return;
            }
            const partida = await response.json();
            localStorage.setItem('partidaId', partida.partidaId);
            

            // Si la partida ya tiene usuario2 asignado y es este usuario, ir directo a la partida
                const currentUserId = getId();

                // Extraer usuario2 de la respuesta comprobando varias variantes de nombres y propiedades
                const usuario2 = partida.usuarioId2 || partida.partidaUsuarioId2 || partida.usuarioId_2 || partida.partidaUsuarioId_2 || partida.partidaUsuarioId2 || null;
                let usuario2Id = null;
                if (usuario2) {
                    usuario2Id = usuario2.id ?? usuario2.usuarioId ?? usuario2.userId ?? null;
                }
                
                if (usuario2Id && currentUserId && Number(usuario2Id) === Number(currentUserId)) {
                    window.location.href = 'partida.html';
                } else {
                    window.location.href = 'lobby.html';
                }
            } catch (error) {
                console.error('No se pudo crear la partida:', error);
            }
        });