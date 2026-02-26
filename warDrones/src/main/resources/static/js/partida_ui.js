//-----------SelecciÃ³n de Bando para Usuario 1 ----------------
function mostrarModalSeleccionarBando() {
    if (isUsuario1) {
        document.getElementById('modalSeleccionarBando').classList.add('active');
    }
}

function cerrarModalSeleccionarBando() {
    document.getElementById('modalSeleccionarBando').classList.remove('active');
}

async function seleccionarBandoNaval() {
    const bandoSeleccionado1 = 'NAVAL';
    const bandoSeleccionado2 = 'AEREO'; // Usuario 2 obtiene el contrario

    await asignarBandosAlServidor(bandoSeleccionado1, bandoSeleccionado2);
    cerrarModalSeleccionarBando();
}

async function seleccionarBandoAereo() {
    const bandoSeleccionado1 = 'AEREO';
    const bandoSeleccionado2 = 'NAVAL'; // Usuario 2 obtiene el contrario

    await asignarBandosAlServidor(bandoSeleccionado1, bandoSeleccionado2);
    cerrarModalSeleccionarBando();
}

async function asignarBandosAlServidor(bando1, bando2) {
    try {
        const res = await api.asignarBandos({
            partidaId: localStorage.getItem('partidaId'),
            bando1: bando1,
            bando2: bando2
        });
        console.log('Respuesta asignarBandos:', res.status, res.statusText);

        if (!res.ok) {
            const msg = await res.text();
            console.error('Error en asignarBandos:', msg);
            setupHint.textContent = "Error al asignar bandos: " + msg;
            return;
        }

        const response = await res.json();
        console.log('Bandos asignados correctamente:', response);

        /* Actualizar bandoSeleccionado para usuario 1 */
        if (isUsuario1) {
            /* Recargar la pÃ¡gina con el bando correcto */
            window.location.href = `partida.html?bando=${bando1.toLowerCase()}`;
        }
    } catch (err) {
        console.error('Error asignando bandos:', err);
        setupHint.textContent = "Error de red al asignar bandos";
    }
}

async function obtenerPartidaInfo() {
    try {
        const partidaId = localStorage.getItem('partidaId');
        const res = await api.partidaInfo(partidaId);

        console.log('Respuesta obtenerPartidaInfo:', res.status, res.statusText);

        if (!res.ok) {
            console.error('Error obteniendo info de partida');
            return null;
        }

        const info = await res.json();
        console.log('Info de partida:', info);
        return info;
    } catch (err) {
        console.error('Error obteniendo info de partida:', err);
        return null;
    }
}

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
        const res = await api.renunciarPartida(partidaId);
        console.log('Respuesta renunciar:', res.status, res.statusText);
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
        const res = await api.guardarPartida(partidaId);
        console.log('Respuesta guardar:', res.status, res.statusText);
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

//Botones del modal de selecciÃ³n de bando
document.getElementById("btnBandoNaval")?.addEventListener("click", seleccionarBandoNaval);
document.getElementById("btnBandoAereo")?.addEventListener("click", seleccionarBandoAereo);

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* InicializaciÃ³n: obtener info de partida y validar si mostrar modal */
async function inicializarPartida() {
    currentUserId = parseInt(localStorage.getItem('userId'));
    const info = await obtenerPartidaInfo();

    if (info) {
        usuario1Id = info.usuarioId1;
        usuario2Id = info.usuarioId2;
        bandasAsignadas = info.bandosAsignados;

        isUsuario1 = (currentUserId === usuario1Id);

        console.log('Usuario actual:', currentUserId);
        console.log('Usuario 1:', usuario1Id);
        console.log('Usuario 2:', usuario2Id);
        console.log('Â¿Soy usuario 1?:', isUsuario1);
        console.log('Â¿Bandos asignados?:', bandasAsignadas);

        /* Si soy usuario 1 y aÃºn no hay bandos asignados, mostrar modal */
        if (isUsuario1 && !bandasAsignadas) {
            setTimeout(() => {
                mostrarModalSeleccionarBando();
            }, 500); // PequeÃ±o delay para que se cargue todo primero
        } else if (!isUsuario1 && !bandasAsignadas) {
            /* Si soy usuario 2 y aÃºn no hay bandos, esperar por SSE */
            console.log('Esperando que usuario 1 seleccione bando...');
        } else if (bandasAsignadas) {
            /* Si ya hay bandos asignados, cargar el mÃ­o */
            const miiBando = isUsuario1 ? info.bando1 : info.bando2;
            console.log('Mi bando:', miiBando);
            bandoSeleccionado = miiBando;
            applyBandoSprite();
        }

        if (Array.isArray(info.drones)) {
            hydrateDronesFromServer(info.drones);
        }
        if (Array.isArray(info.portadrones)) {
            hydratePortadronesFromServer(info.portadrones);
        }
    }

    revealStartColumnsByBando();
    revealAroundActiveDrone();
    updateInfoPanel();
    drawScene();
}

inicializarPartida();


//------------Logica de notificaciones----------------
const usuarioId = localStorage.getItem("userId");
const currentPartidaId = localStorage.getItem("partidaId");

if (usuarioId && currentPartidaId) {
    const eventSource = api.lobbyEventSource(usuarioId);

    eventSource.addEventListener("partida-finalizada", (event) => {
        const pid = String(event.data);
        if (pid === String(currentPartidaId)) {
            eventSource.close();
            window.location.href = "menu.html";
        }
    });

    // Si el servidor emite 'partida-start' mientras el cliente ya está en partida.html,
    // actualizar la vista recargando la información desde el servidor y activar la UI de juego.
    eventSource.addEventListener("partida-start", (event) => {
        try {
            const pid = String(event.data);
            if (pid === String(currentPartidaId)) {
                // Recargar info y UI en caliente
                obtenerPartidaInfo().then((info) => {
                    if (info) {
                        const miiBando = isUsuario1 ? info.bando1 : info.bando2;
                        bandoSeleccionado = miiBando || bandoSeleccionado;
                        applyBandoSprite();
                        if (Array.isArray(info.drones)) hydrateDronesFromServer(info.drones);
                        if (Array.isArray(info.portadrones)) hydratePortadronesFromServer(info.portadrones);
                        revealStartColumnsByBando();
                        revealAroundActiveDrone();
                        updateInfoPanel();
                        drawScene();
                    }
                });
            }
        } catch (e) { console.warn('Error manejando partida-start', e); }
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

    /* Mueve al dron activo hacia una celda de destino (click).
       Solo permite destinos dentro del radio de movimiento */
    function moveActiveDroneTo(targetX, targetY) {
        if (isMoving) {
            return;
        }

        /* Doble guardia para bloquear movimiento simultaneo */
        if (isMoving) {
            return;
        }

        if (isPortaSelected) {
            const ownPorta = getOwnPorta();
            const enemyPorta = getEnemyPorta();
            const newX = Math.min(cols - ownPorta.size, Math.max(0, targetX));
            const newY = Math.min(rows - ownPorta.size, Math.max(0, targetY));
            const centerX = ownPorta.x + (ownPorta.size / 2);
            const centerY = ownPorta.y + (ownPorta.size / 2);
            const targetCenterX = newX + (ownPorta.size / 2);
            const targetCenterY = newY + (ownPorta.size / 2);
            const dx = targetCenterX - centerX;
            const dy = targetCenterY - centerY;
            const moveRadius = ownPorta.moveRadius;
            const isInsideCircle = (dx * dx) + (dy * dy) <= moveRadius * moveRadius;

            if (!isInsideCircle) {
                return;
            }
            if ((newX === ownPorta.x && newY === ownPorta.y)
                || isDroneInPortaArea(newX, newY, ownPorta.size)
                || overlapsPorta(newX, newY, ownPorta.size, enemyPorta)) {
                return;
            }

            isMoving = true;
            function animatePortaStep() {
                if (ownPorta.x === newX && ownPorta.y === newY) {
                    isMoving = false;
                    return;
                }

                const stepX = Math.sign(newX - ownPorta.x);
                const stepY = Math.sign(newY - ownPorta.y);
                const nextX = ownPorta.x + stepX;
                const nextY = ownPorta.y + stepY;
                if (isDroneInPortaArea(nextX, nextY, ownPorta.size) || overlapsPorta(nextX, nextY, ownPorta.size, enemyPorta)) {
                    isMoving = false;
                    return;
                }
                ownPorta.x = nextX;
                ownPorta.y = nextY;
                revealAroundActiveDrone();
                drawScene();
                setTimeout(animatePortaStep, stepDelayMs);
            }
            animatePortaStep();
            return;
        }

        const drone = getActiveDrone();
        if (!drone || !drone.deployed) {
            return;
        }

        const newX = Math.min(cols - 1, Math.max(0, targetX));
        const newY = Math.min(rows - 1, Math.max(0, targetY));
        const dx = newX - drone.x;
        const dy = newY - drone.y;
        const moveRadius = drone.moveRadius;
        const isInsideCircle = (dx * dx) + (dy * dy) <= moveRadius * moveRadius;

        if (!isInsideCircle) {
            return;
        }

        if (newX === drone.x && newY === drone.y) {
            return;
        }
        if (isInsideAnyPorta(newX, newY)) {
            return;
        }

        isMoving = true;

        /* Animacion por pasos hasta llegar al destino */
        function animateStep() {
            if (drone.x === newX && drone.y === newY) {
                isMoving = false;
                return;
            }

            const stepX = Math.sign(newX - drone.x);
            const stepY = Math.sign(newY - drone.y);
            drone.x += stepX;
            drone.y += stepY;
            revealAroundActiveDrone();
            drawScene();

            setTimeout(animateStep, stepDelayMs);
        }

        animateStep();
    }

    /* Click sobre canvas:
       1) si haces click en un dron, lo selecciona
       2) si haces click en una celda vacia, intenta mover al dron activo */
    canvas.addEventListener('click', async (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / grid);
        const y = Math.floor((event.clientY - rect.top) / grid);

        // si estamos en modo ataque, cualquier click intenta disparar
        if (isAttackMode) {
            let objetivoId = null;
            const atacante = getActiveDrone(); // Ya validado en el listener del botÃ³n de ataque

            // si se clickea en porta enemigo, objetivo 0 segÃºn backend
            if (isInsidePortaArea(x, y, getEnemyPorta())) {
                objetivoId = 0;
            } else {
                // NOTA: Esto actualmente solo permite seleccionar drones del propio bando como objetivos,
                // ya que el array `drones` solo contiene la flota del jugador.
                // Para atacar enemigos, se necesitarÃ¡ una lista de drones enemigos visibles.
                const targetIndex = drones.findIndex(d => d.deployed && d.x === x && d.y === y);
                if (targetIndex >= 0) {
                    objetivoId = drones[targetIndex].id;
                }
            }

            if (objetivoId !== null) {
                try {
                    const res = await api.atacarDronOPorta({
                        partidaId: localStorage.getItem('partidaId'),
                        jugadorId: getId(),
                        dronAtacanteId: atacante.id,
                        dronObjetivoId: objetivoId
                    });
                    console.log('Respuesta atacarDronOPorta:', res.status, res.statusText);
                    if (!res.ok) {
                        const msg = await res.text();
                        console.error('Error en atacarDronOPorta:', msg);
                        setupHint.textContent = "Error al atacar: " + msg;
                        //alert('Error al atacar: ' + msg);
                    } else {
                        setupHint.textContent = 'Ataque enviado. Esperando actualizaciÃ³n del servidor.';
                    }
                } catch (err) {
                    console.error('Error enviando ataque:', err);
                    alert('Error de red al intentar atacar.');
                }
            } else {
                setupHint.textContent = 'Seleccione un objetivo vÃ¡lido para atacar';
            }
            isAttackMode = false;
            return;
        }

        let esSelec = false;

        if (isDeployMode) {
            const drone = getActiveDrone();
            if (!drone) {
                setupHint.textContent = 'No hay dron seleccionado para desplegar';
                isDeployMode = false;
                return;
            }

            if (x < 0 || y < 0 || x >= cols || y >= rows) {
                setupHint.textContent = 'Celda fuera del mapa';
                return;
            }

            if (!discovered[y][x]) {
                setupHint.textContent = 'No puedes desplegar en zona con niebla';
                return;
            }

            const occupied = drones.some((d) => d.deployed && d.x === x && d.y === y);
            if (occupied || isInsideAnyPorta(x, y)) {
                setupHint.textContent = 'Celda ocupada. Elige otra celda';
                return;
            }

            // Persistir el despliegue en el servidor antes de aceptar localmente
            try {
                const resDeploy = await api.desplegarDron({
                    partidaId: localStorage.getItem('partidaId'),
                    jugadorId: getId(),
                    dronId: drone.id,
                    x: x,
                    y: y
                });
                if (!resDeploy.ok) {
                    const msg = await resDeploy.text();
                    console.error('Error desplegarDron:', msg);
                    setupHint.textContent = 'Error al desplegar dron: ' + msg;
                    isDeployMode = false;
                    return;
                }

                // Solo si server aceptó, aplicar en UI
                drone.deployed = true;
                drone.x = x;
                drone.y = y;
                isDeployMode = false;
                revealAroundActiveDrone();
                updateInfoPanel();
                drawScene();
            } catch (err) {
                console.error('Error en desplegarDron:', err);
                setupHint.textContent = 'Error de red al desplegar dron';
                isDeployMode = false;
                return;
            }

            /* Contar cuÃ¡ntos drones estÃ¡n desplegados */
            const deployedCount = drones.filter(d => d.deployed).length;
            const totalDrones = drones.length;

            console.log(`Drones desplegados: ${deployedCount}/${totalDrones}`);

            /* Si todos los drones de este lado estÃ¡n desplegados, iniciar partida */
            if (deployedCount === totalDrones) {
                try {
                    const res = await api.iniciarPartida(localStorage.getItem("partidaId"));
                    console.log('Respuesta iniciarPartida:', res.status, res.statusText);

                    if (!res.ok) {
                        const msg = await res.text();
                        console.error('Error en iniciarPartida:', msg);
                        setupHint.textContent = "Error al iniciar partida: " + msg;
                        return;
                    }

                    const response = await res.json();
                    console.log('Datos de iniciarPartida:', response);

                    /* Si la partida estÃ¡ iniciada (ambos bandos desplegados), actualizar botones */
                    if (response.iniciada) {
                        console.log('Partida iniciada. Mostrando botones de acciÃ³n.');
                        updateButtonsVisibility(true);
                        setupHint.textContent = 'Partida iniciada. Jugador en turno: ' + response.jugadorEnTurno;

                    } else {
                        console.log('Esperando segundo jugador. Bandos desplegados:', response.bandosDesplegados);
                        setupHint.textContent = 'Tu despliegue completado. Esperando al otro jugador.';
                    }
                } catch (err) {
                    console.error('Error en la peticiÃ³n iniciarPartida:', err);
                    setupHint.textContent = "Error de red al iniciar partida";
                }
            }

            return;
        }

        const clickedDroneIndex = drones.findIndex((drone) => drone.deployed && drone.x === x && drone.y === y);
        if (clickedDroneIndex >= 0) {
            gameState.setActiveDroneById(drones[clickedDroneIndex].id);
            activeDroneId = gameState.activeDroneId;
            isPortaSelected = false;
            revealAroundActiveDrone();
            updateInfoPanel();
            drawScene();
            esSelec = true;
            return;
        }

        if (isInsidePortaArea(x, y, getOwnPorta())) {
            isPortaSelected = true;
            isDeployMode = false;
            revealAroundActiveDrone();
            updateInfoPanel();
            drawScene();
            return;
        }

        if (isInsidePortaArea(x, y, getEnemyPorta())) {
            return;
        }

        // Si no fue un click de selecciÃ³n y estamos en modo movimiento, procesar la acciÃ³n.
        if (!esSelec && isMoveMode) {
            try {
                let res;
                if (isPortaSelected) {
                    res = await api.moverPortadron({
                        partidaId: localStorage.getItem("partidaId"),
                        jugadorId: getId(),
                        x: x,
                        y: y
                    });
                    console.log('Respuesta moverPortadron:', res.status, res.statusText);
                } else {
                    const drone = getActiveDrone();
                    if (!drone || !drone.deployed) {
                        setupHint.textContent = 'Selecciona un dron desplegado para moverlo.';
                        isMoveMode = false;
                        return;
                    }
                    res = await api.moverDron({
                        partidaId: localStorage.getItem("partidaId"),
                        jugadorId: getId(),
                        dronId: drone.id,
                        x: x,
                        y: y
                    });
                    console.log('Respuesta moverDron:', res.status, res.statusText);
                }

                if (res.ok) {
                    // ActualizaciÃ³n optimista: Mueve la unidad en el cliente para dar feedback visual inmediato.
                    // Lo ideal serÃ­a que el servidor envÃ­e el nuevo estado del juego vÃ­a SSE.
                    moveActiveDroneTo(x, y);
                } else {
                    const msg = await res.text();
                    console.error('Error en moverDron/moverPortadron:', msg);
                    setupHint.textContent = "Error al mover: " + msg;
                    // alert("Error al mover: " + msg);
                }
            } catch (err) {
                console.error('Error en la peticiÃ³n de movimiento:', err);
                alert('Error de red al intentar mover.');
            } finally {
                // Salir del modo movimiento y limpiar el hint despuÃ©s del intento.
                isMoveMode = false;
                setupHint.textContent = '';
            }
            return; // La acciÃ³n de click ha sido manejada.
        }

        // Si se hizo click sin estar en modo movimiento, asegurarse de que el modo se desactive.
        if (isMoveMode) isMoveMode = false;
    });

    function getId() {
        const id = localStorage.getItem('userId');
        return id ? parseInt(id) : null;
    }

    /* Boton del panel para avanzar al siguiente dron de la flota */
    nextDroneBtn.addEventListener('click', () => {
        if (!drones.length) {
            return;
        }

        const found = gameState.selectNextDeployedDrone();
        if (!found) {
            setupHint.textContent = 'No hay drones desplegados para cambiar';
            return;
        }

        activeDroneId = gameState.activeDroneId;
        isPortaSelected = false;
        isDeployMode = false;
        isAttackMode = false;
        isMoveMode = false;
        revealAroundActiveDrone();
        updateInfoPanel();
        drawScene();
    });

    deployDroneBtn.addEventListener('click', () => {
        const drone = getActiveDrone();
        if (!drone) {
            setupHint.textContent = 'No hay dron seleccionado';
            return;
        }
        if (drone.deployed) {
            setupHint.textContent = 'Ese dron ya esta desplegado';
            return;
        }

        isDeployMode = true;
        isAttackMode = false;
        isMoveMode = false;
        setupHint.textContent = `Despliegue activo: haz click en el mapa para colocar #${drone.id}`;
    });

    // nuevo botÃ³n movimiento
    moveBtn.addEventListener('click', () => {
        isMoveMode = true;
        isAttackMode = false;
        isDeployMode = false;
        setupHint.textContent = 'Modo movimiento: haz click en la celda destino';
    });

    // nuevo botÃ³n atacar
    attackBtn.addEventListener('click', () => {
        const activeDrone = getActiveDrone();
        if (!activeDrone || !activeDrone.deployed) {
            setupHint.textContent = 'Selecciona un dron desplegado para atacar.';
            return;
        }
        isAttackMode = true;
        isMoveMode = false;
        isDeployMode = false;
        setupHint.textContent = 'Modo ataque: selecciona un objetivo (dron o porta enemigo)';
    });

    // nuevo botÃ³n recargar
    reloadBtn.addEventListener('click', async () => {
        const drone = getActiveDrone();
        if (!drone || !drone.deployed) {
            setupHint.textContent = 'No hay dron desplegado para recargar';
            return;
        }

        try {
            const res = await api.recargarDron({
                partidaId: localStorage.getItem('partidaId'),
                jugadorId: getId(),
                dronId: drone.id
            });
            console.log('Respuesta recargarDron:', res.status, res.statusText);
            if (!res.ok) {
                const msg = await res.text();
                console.error('Error en recargarDron:', msg);
                setupHint.textContent = "Error al recargar: " + msg;
                // alert('Error al recargar: ' + msg);
            } else {
                setupHint.textContent = 'Recarga enviada. Esperando actualizaciÃ³n del servidor.';
            }
        } catch (err) {
            console.error('Error recargando dron:', err);
        }
        // despuÃ©s de la acciÃ³n vuelve al modo normal
        isAttackMode = false;
        isMoveMode = false;
    });

    /* Evento que se ejecuta cuando cambia el tamaï¿½o de la ventana.
       Recalcula el canvas y redibuja el mapa para mantener la escala correcta */
    window.addEventListener('resize', resizeCanvas);

    class PartidaApp {
        constructor(bandoEntrada) {
            this.bandoSeleccionado = this.normalizarBando(bandoEntrada ?? bandoSeleccionado);
        }

        normalizarBando(valor) {
            return String(valor || "AEREO").toUpperCase() === "NAVAL" ? "NAVAL" : "AEREO";
        }

        esNaval() {
            return this.bandoSeleccionado === 'NAVAL';
        }

        esAereo() {
            return this.bandoSeleccionado === 'AEREO';
        }

        cargarSpriteDronNaval() {
            droneSprite.src = '../img/dron_naval.png';
        }

        cargarSpriteDronAereo() {
            droneSprite.src = '../img/dron_aereo.png';
        }

        cargarSpritePortaNaval() {
            portaDronNavalSprite.src = '../img/Porta_dron_naval.png';
        }

        cargarSpritePortaAereo() {
            portaDronAereoSprite.src = '../img/Porta_dron_aereo.png';
        }

        ajustarCanvasBase() {
            const rect = canvas.getBoundingClientRect();
            canvas.width = Math.floor(rect.width);
            canvas.height = Math.floor(rect.height);
            cols = Math.max(1, Math.floor(canvas.width / grid));
            rows = Math.max(1, Math.floor(canvas.height / grid));
        }

        reiniciarNiebla() {
            discovered = Array.from({ length: rows }, () => Array(cols).fill(false));
        }

        revelarInicioNaval() {
            const columnsToReveal = Math.min(3, cols);
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < columnsToReveal; x++) {
                    discovered[y][x] = true;
                }
            }
        }

        revelarInicioAereo() {
            const columnsToReveal = Math.min(3, cols);
            for (let y = 0; y < rows; y++) {
                for (let i = 0; i < columnsToReveal; i++) {
                    discovered[y][cols - 1 - i] = true;
                }
            }
        }

        posicionarPortaNaval() {
            positionPortaDronNaval();
        }

        posicionarPortaAereo() {
            positionPortaDronAereo();
        }

        crearFlotaSegunBando() {
            /* La flota ahora llega del backend en inicializarPartida(). */
        }

        menuNaval() {
            isDeployMode = false;
            updateInfoPanel();
        }

        menuAereo() {
            isDeployMode = false;
            updateInfoPanel();
        }

        desplegarDronesNaval() {
            isDeployMode = false;
        }

        desplegarDronesAereo() {
            isDeployMode = false;
        }

        aplicarVisionActiva() {
            revealAroundActiveDrone();
        }

        renderizarEscena() {
            drawScene();
        }

        iniciarLoop() {
            requestAnimationFrame(gameLoop);
        }



    }

    window.PartidaApp = PartidaApp;

}
