//-----------Seleccion de Bando para Usuario 1 ----------------
function mostrarModalSeleccionarBando() {
    console.log("mostrarModalSeleccionarBando()", { isUsuario1 });

    const modal = document.getElementById("modalSeleccionarBando");
    console.log("modal:", modal);

    if (isUsuario1 && modal) modal.classList.remove("oculto");
}

function cerrarModalSeleccionarBando() {
    document.getElementById("modalSeleccionarBando")?.classList.add("oculto");
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
            const raw = await res.text();
            let display = raw;
            try {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') display = parsed.error || parsed.message || parsed.msg || display;
            } catch (e) { }
            console.error('Error en asignarBandos:', display);
            showBattleToast(display, "error", 2200);
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
        showBattleToast("Error de red al asignar bandos.", "error", 2200);
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

async function cargarNieblaDescubierta() {
    try {
        const partidaId = localStorage.getItem('partidaId');
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        // Primero intentar servidor
        const res = await fetch(`${API_URL}/partida/fog/${partidaId}?usuarioId=${encodeURIComponent(userId)}`);
        if (res.ok) {
            const fog = await res.json();
            if (Array.isArray(fog) && fog.length > 0) {
                discovered = fog;
                return; // servidor tenía datos, listo
            }
        }
    } catch (err) {
        console.error('Error cargando niebla del servidor:', err);
    }

    // Fallback: intentar desde localStorage
    const key = `fog_${localStorage.getItem('partidaId')}_${localStorage.getItem('userId')}`;
    const saved = localStorage.getItem(key);
    if (saved) {
        try {
            const localFog = JSON.parse(saved);
            if (Array.isArray(localFog) && localFog.length > 0) {
                discovered = localFog;
                console.log('Niebla recuperada desde localStorage');
            }
        } catch (e) {
            console.error('Error parseando niebla local:', e);
        }
    }
}

//-----------Actualizar Estado del Turno----------------
function actualizarEstadoTurno() {
    /* Si todavía no terminaron ambos despliegues, no mostrar estado de turno */
    if (bandosDesplegados < 2) {
        return;
    }

    /* Si la partida ya está lista pero aún no llegó turno válido */
    if (turnoActual === null || typeof turnoActual === 'undefined') {
        setStatusBar("TURNO:", "Esperando...");
        return;
    }

    statusBattleTurn();
}

//-----------Modal Salir----------------
function abrirModalSalir() {
    document.getElementById('modalSalir')?.classList.remove('oculto');
}

function cerrarModalSalir() {
    document.getElementById('modalSalir')?.classList.add('oculto');
}

function abrirModalVictoria() {
    document.getElementById('modalVictoria')?.classList.remove('oculto');
}

function cerrarMensajeVictoria() {
    document.getElementById('modalVictoria')?.classList.add('oculto');
}

function abrirMensajeAviso() {
    document.getElementById('modalAvisos')?.classList.remove('oculto');
}

function cerrarMensajeAviso() {
    document.getElementById('modalAvisos')?.classList.add('oculto');
}


async function abandonarPartida() {
    const partidaId = localStorage.getItem("partidaId");
    console.log("Abandonar partida. partidaId:", partidaId);
    if (!partidaId) return;

    try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
        const res = await api.renunciarPartida(partidaId, userId);
        console.log('Respuesta renunciar:', res.status, res.statusText);
    } catch (error) {
        console.error("Error abandonando partida:", error);
        return;
    }

    cerrarModalSalir();
    window.location.href = 'menu.html';
}

async function cerrarPartida() {
    const partidaId = localStorage.getItem("partidaId");
    console.log("Cerrar partida. partidaId:", partidaId);
    if (!partidaId) return;

    try {
        const res = await api.cerrarPartida(partidaId);
        console.log('Respuesta cerrar:', res.status, res.statusText)
    } catch (error) {
        console.error("Error cerrando la partida.", error);
    }

    cerrarMensajeVictoria();
    window.location.href = 'menu.html';
}

async function guardarPartida() {
    const partidaId = localStorage.getItem("partidaId");
    uGuardador = true;
    console.log("Guardar partida. partidaId:", partidaId);
    if (!partidaId) return;

    try {
        const res = await api.guardarPartida(partidaId);
        console.log('Respuesta guardar:', res.status, res.statusText);
    } catch (error) {
        console.error("Error guardando partida:", error);
        return;
    }
}

async function salirPartida() {
    cerrarMensajeVictoria();
    cerrarMensajeAviso();
    window.location.href = 'menu.html';
}

//boton que abre el modal
document.getElementById("btnSalir")?.addEventListener("click", abrirModalSalir);

//Botones del modal
document.getElementById("btnConfirmarSalir")?.addEventListener("click", abandonarPartida);
document.getElementById("btnCerrarPartida")?.addEventListener("click", cerrarPartida);
document.getElementById("btnSalirPartida")?.addEventListener("click", salirPartida)

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
    if (!currentUserId || isNaN(currentUserId)) {
        console.warn('No hay userId válido en localStorage:', localStorage.getItem('userId'));
        showBattleToast('Error: usuario no identificado. Vuelve al menú e inicia sesión.', 'error', 2200);
        return;
    }

    const partidaId = localStorage.getItem('partidaId');
    if (!partidaId) {
        console.warn('No hay partidaId en localStorage');
        showBattleToast('No se encontró partida. Vuelve al menú y crea/carga una partida.', 'error', 2200);
        return;
    }

    const info = await obtenerPartidaInfo();

    if (info) {
        usuario1Id = info.usuarioId1;
        usuario2Id = info.usuarioId2;
        bandasAsignadas = info.bandosAsignados;
        turnoActual = info.turnoActual;  // Extraer turnoActual del servidor
        bandosDesplegados = info.bandosDesplegados || 0;  // Extraer bandosDesplegados del servidor

        console.log('Info de partida devuelta por el servidor:', info);

        // si la respuesta indica bandos asignados pero los valores son nulos/indefinidos,
        // forzamos la bandera a false para que el usuario pueda volver a elegir.
        if (bandasAsignadas && (!info.bando1 || !info.bando2)) {
            console.warn('Servidor reportó bandosAsignados pero no hay bando1/bando2');
            bandasAsignadas = false;
        }

        isUsuario1 = Number(currentUserId) === Number(usuario1Id);

        const bandoEnURL = new URLSearchParams(window.location.search).get("bando");
        const bandosListos = !!info.bando1 && !!info.bando2;

        console.log('Usuario actual:', currentUserId);
        console.log('Usuario 1:', usuario1Id);
        console.log('Usuario 2:', usuario2Id);
        console.log('Â¿Soy usuario 1?:', isUsuario1);
        console.log('Â¿Bandos asignados?:', bandasAsignadas);

        /* Si soy usuario 1 y aun no hay bandos asignados (o no se conocen), mostrar modal */
        if (isUsuario1 && !bandosListos) {
            setTimeout(() => {
                mostrarModalSeleccionarBando();
            }, 500);

        } else if (!isUsuario1 && !bandosListos) {
            console.log('Esperando que usuario 1 seleccione bando...');
            abrirModalEsperandoBando();

        } else if (bandosListos) {
            cerrarModalEsperandoBando();
            cerrarModalSeleccionarBando();

            const miBando = isUsuario1 ? info.bando1 : info.bando2;
            console.log('Mi bando:', miBando);
            bandoSeleccionado = miBando;

            applyBandoSprite();
            applyPortaSprites();
            renderPortaHud(bandoSeleccionado);
        }


        if (Array.isArray(info.drones)) {
            hydrateDronesFromServer(info.drones);
        }

        if (Array.isArray(info.portadrones)) {
            hydratePortadronesFromServer(info.portadrones);
            const miPorta = info.portadrones.find(
                p => String(p.tipo || p.bando || "").toUpperCase() === String(bandoSeleccionado).toUpperCase()
            );

            if (miPorta) {
                const vidaMax = (bandoSeleccionado === "NAVAL") ? 3 : 6;
                actualizarVidaPortadron(miPorta.vida, vidaMax);
            }
        }

        /* Solo revelar columnas iniciales si los bandos estÃ¡n confirmados */
        if (bandasAsignadas) {
            if (!discovered.length > 0)
                discovered = Array.from({ length: rows }, () => Array(cols).fill(false));
            revealStartColumnsByBando();
            revealAroundAllDeployedDrones(); // revela entorno de todos los drones, no solo el activo
            revealAroundActiveDrone();
            updateInfoPanel();
            statusDeployBase();

            // cargar niebla previamente guardada (si existe)
            // if (!info.esNueva)
            await cargarNieblaDescubierta();

            /* Si la partida ya estÃ¡ iniciada (ambos bandos desplegados), mostrar botones de acciÃ³n */
            if (info.bandosDesplegados === 2) {
                updateButtonsVisibility(true);
            }
            actualizarAyudaPartida();

            drawScene();
        } else {
            /* Si aÃºn no hay bandos, dibujar canvas sin revelar nada */
            drawScene();
        }
    } else {
        /* Si no hay info, dibujar canvas vacÃ­o */
        drawScene();
    }

    /* Actualizar estado del turno al inicializar */
    actualizarEstadoTurno();
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
            // En vez de quitarte te muestra el mensaje
            abrirModalVictoria();
            mostrarGanador(getId());
            // window.location.href = "menu.html";
        }
    });

    eventSource.addEventListener("partida-ganada", (event) => {
        const data = JSON.parse(event.data);
        const gid = String(data.jugadorId);
        const pid = String(data.partidaId);

        console.log("gid: " + gid)
        if (pid === String(currentPartidaId)) {
            abrirModalVictoria();
            mostrarGanador(gid);
        }
    });


    // Si el servidor emite 'partida-start' mientras el cliente ya está en partida.html,
    // actualizar la vista recargando la información desde el servidor y activar la UI de juego.
    eventSource.addEventListener("partida-start", (event) => {
        try {
            const pid = String(event.data);
            if (pid === String(currentPartidaId)) {
                cerrarModalEsperandoBando();
                // Recargar info y UI en caliente
                obtenerPartidaInfo().then((info) => {
                    if (info) {
                        turnoActual = info.turnoActual;  // Actualizar turnoActual
                        bandosDesplegados = info.bandosDesplegados || 0;  // Actualizar bandosDesplegados
                        const miiBando = isUsuario1 ? info.bando1 : info.bando2;
                        bandoSeleccionado = miiBando || bandoSeleccionado;
                        fin = info.finalizada;
                        ganador = info.ganadorId;

                        // Si eres usuario 2, recarga la página con el bando en la URL
                        // para que si recargas manualmente, no pierdas el contexto
                        if (!isUsuario1 && miiBando) {
                            window.location.href = `partida.html?bando=${miiBando.toLowerCase()}`;
                            return; // No continuar; la página se recargará
                        }

                        applyBandoSprite();
                        applyPortaSprites();
                        if (Array.isArray(info.drones)) hydrateDronesFromServer(info.drones);
                        if (Array.isArray(info.portadrones)) hydratePortadronesFromServer(info.portadrones);
                        revealStartColumnsByBando();
                        revealAroundActiveDrone();
                        updateInfoPanel();
                        updateButtonsVisibility(true);
                        actualizarAyudaPartida();

                        actualizarEstadoTurno();  // Actualizar estado del turno
                        drawScene();

                    }

                });
            }
        } catch (e) { console.warn('Error manejando partida-start', e); }
    });


    /*Evento que se dispara al realizar una accion se le avisa al otro usuario para actualizar data*/
    eventSource.addEventListener("accion-realizada", (event) => {
        /*cargo partida id y usuarioid*/
        const data = JSON.parse(event.data);
        const uid = String(data.usuarioId);
        const pid = String(data.partidaId);
        if (pid === String(currentPartidaId) && uid !== String(getId())) {
            console.log("Actualiza info");
            actualizarInfo();
        }
    });

    eventSource.addEventListener("partida-guardada", (event) => {
        const pid = String(event.data);
        if (pid === String(currentPartidaId))
            guardarDiscovered();

        if (!uGuardador) {
            abrirMensajeAviso();
            mostrarAviso("El usuario rival a guardado la partida");
        }
        else {
            window.location.href = "menu.html";
        }
    });

    async function guardarDiscovered() {
        try {
            let fogJson = JSON.stringify(discovered);
            const res = await api.guardarDiscovered(currentPartidaId, getId(), fogJson);
        } catch (error) {
            console.error("Error guardando discovered:", error);
        }
    }

    eventSource.onerror = (error) => {
        console.warn("SSE cerrado/error:", error);
        eventSource.close();
    };

    function getAllDrones(serverDrones) {
        const allDrones = Array.isArray(serverDrones) ? serverDrones : [];
        const ownDrones = (allDrones || [])
            .filter((d) => !d.bando || d.bando === bandoSeleccionado)
            .map(mapDroneFromServer);

        const rivalDrones = (allDrones || [])
            .filter((d) => d.bando && d.bando !== bandoSeleccionado)
            .map(mapDroneFromServer);

        gameState.setDrones(ownDrones);
        gameState.setDronesRivales(rivalDrones);
        drones = gameState.drones;
        dronesRivales = gameState.dronesRivales;
        activeDroneId = gameState.activeDroneId;
    }

    /* Funcion para obtener info nueva de la partida y actualizar, se llama cada vez que se recibe nueva info del servidor 
    (ej: por SSE) o se hace una accion que puede cambiar el estado de la partida (ej: mover dron) */
    /*Cuando realizo una accion se avisa al otro usuario para que actualize*/

    async function actualizarInfo() {
        console.log('Actualizando info de partida desde servidor...');
        const info = await obtenerPartidaInfo();
        if (!info) return;

        const b1 = info.partidaBando1 ?? info.bando1 ?? info.partida_bando1 ?? info.partida_bando_1;
        const b2 = info.partidaBando2 ?? info.bando2 ?? info.partida_bando2 ?? info.partida_bando_2;

        hydrateDronesFromServer(info.drones);
        getAllDrones(info.drones);

        if (Array.isArray(info.portadrones)) {
            hydratePortadronesFromServer(info.portadrones);

            const miPorta = info.portadrones.find(
                p => String(p.tipo || p.bando || "").toUpperCase() === String(bandoSeleccionado).toUpperCase()
            );
            if (miPorta) {
                const vidaMax = (String(bandoSeleccionado).toUpperCase() === "NAVAL") ? 3 : 6;
                actualizarVidaPortadron(miPorta.vida, vidaMax);
            }
        }

        turnoActual = info.turnoActual;
        bandosDesplegados = info.bandosDesplegados || bandosDesplegados;
        actualizarEstadoTurno();

        drawScene(); // ← único punto de render
    }


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

    //************SOLUCION TEMPORAL PARA QUE PERMITA ELEGIR LA ULTIMA COLUMNA, HAY QUE CORREGIR DIRECTAMENTE COMO SE ARMA EL CANVAS ****************************/
    function isInsideDeploymentZone(x, y) {
        const firstThirdEnd = Math.floor(cols / 3);
        const secondThirdStart = cols - firstThirdEnd;

        console.log("NAVAL límite:", Math.floor(cols / 3));
        console.log("AEREO límite:", Math.ceil(2 * cols / 3));

        if (bandoSeleccionado === 'NAVAL') {
            return x < firstThirdEnd + 1;
        } else {
            return x >= secondThirdStart - 1;
        }
    }

    /* Click sobre canvas:
       1) si haces click en un dron, lo selecciona
       2) si haces click en una celda vacia, intenta mover al dron activo */
    canvas.addEventListener('click', async (event) => {
        const rect = canvas.getBoundingClientRect();
        const borderWidth = parseFloat(getComputedStyle(canvas).borderLeftWidth) || 0;
        const scaleX = canvas.width / (rect.width - borderWidth * 2);
        const scaleY = canvas.height / (rect.height - borderWidth * 2);
        const x = Math.floor((event.clientX - rect.left - borderWidth) * scaleX / cellSize);
        const y = Math.floor((event.clientY - rect.top - borderWidth) * scaleY / cellSize);
        console.log('canvas.width:', canvas.width, 'rect.width:', rect.width, 'ratio:', rect.width / canvas.width);


        if (!isAttackMode && !isMoveMode && !isReloadMode && !isDeployMode) {
            if (isInsidePortaArea(x, y, getOwnPorta())) {
                updateButtonByChosen(true);
            }

            const droneIndex = drones.findIndex((drone) =>
                drone.deployed && drone.x === x && drone.y === y
            );

            if (droneIndex >= 0) {
                updateButtonByChosen(false);
            }
        }

        // si estamos en modo ataque, cualquier click intenta disparar
        if (isAttackMode) {
            let objetivoId = null;
            const atacante = getActiveDrone(); // Ya validado en el listener del botÃ³n de ataque

            if (!atacante || !atacante.deployed || atacante.vida <= 0) {
                setupHint.textContent = 'El dron seleccionado ya no puede atacar.';
                isAttackMode = false;
                return;
            }

            if (!validaPosicion(x, y)) {
                showBattleToast("Celda fuera del rango de ataque.", "error"); isAttackMode = false;
                return;
            }

            // si se clickea en porta enemigo, objetivo 0 segÃºn backend
            if (isInsidePortaArea(x, y, getEnemyPorta())) {
                objetivoId = 0;
            } else {
                const targetIndex = dronesRivales.findIndex(d => d.deployed && d.x === x && d.y === y && d.vida > 0);
                if (targetIndex >= 0) {
                    if (dronesRivales[targetIndex].vida > 0)
                        objetivoId = dronesRivales[targetIndex].id;
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
                        const raw = await res.text();
                        let display = raw;
                        try {
                            const parsed = JSON.parse(raw);
                            if (parsed && typeof parsed === 'object') display = parsed.error || parsed.message || parsed.msg || display;
                        } catch (e) { }
                
                        console.error('Error en atacarDronOPorta:', display);
                        showBattleToast(display, "error", 2200);
                    
                    } else {
                        const dronLocal = drones.find(d => d.id === atacante.id);

                        if (dronLocal && typeof dronLocal.municion === "number" && dronLocal.municion > 0) {
                            dronLocal.municion -= 1;
                        }

                        if (atacante && typeof atacante.municion === "number" && atacante.municion > 0) {
                            atacante.municion = dronLocal ? dronLocal.municion : atacante.municion - 1;
                        }

                        updateInfoPanel();
                        drawScene();
                        showBattleToast("Ataque enviado.", "success");
                    }
                } catch (err) {
                    console.error('Error enviando ataque:', err);
                    showBattleToast("Error de red al intentar atacar.", "error", 2200);
                }
            } else {
                showBattleToast("Seleccione un objetivo valido para atacar.", "error", 2200);
            }
            isAttackMode = false;
            updateActionButtonSelection();

            return;
        }

        let esSelec = false;

        if (isDeployMode) {
            const drone = getActiveDrone();
            if (!drone) {
                showBattleToast("No hay dron seleccionado para desplegar.", "error"); isDeployMode = false;
                return;
            }

            if (x < 0 || y < 0 || x >= cols || y >= rows) {
                showBattleToast("Celda fuera del mapa.", "error");
                return;
            }

            if (!discovered[y][x]) {
                showBattleToast("No puedes desplegar en zona con niebla.", "error");
                return;
            }

            if (!isInsideDeploymentZone(x, y)) {
                showBattleToast("Debes desplegar dentro de tu zona de despliegue.", "error");
                return;
            }

            if (isPosicionOcupada(x, y)) {
                showBattleToast("Celda ocupada. Elige otra celda", "error");
                isMoveMode = false;
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
                    const raw = await resDeploy.text();
                    let display = raw;
                    try {
                        const parsed = JSON.parse(raw);
                        if (parsed && typeof parsed === 'object') display = parsed.error || parsed.message || parsed.msg || display;
                    } catch (e) { }
                    console.error('Error desplegarDron:', display);
                    showBattleToast(display, "error", 2200);
                    isDeployMode = false;
                    return;
                }

                // Solo si server aceptó, aplicar en UI
                drone.deployed = true;
                drone.x = x;
                drone.y = y;
                isDeployMode = false;
                saveFogLocally();
                revealAroundActiveDrone();
                updateInfoPanel();
                drawScene();
            } catch (err) {
                console.error('Error en desplegarDron:', err);
                showBattleToast("Error de red al desplegar dron.", "error", 2200); isDeployMode = false;
                return;
            }

            /* Contar cuantos drones estan desplegados */
            const deployedCount = drones.filter(d => d.deployed).length;
            const totalDrones = drones.length;

            console.log(`Drones desplegados: ${deployedCount}/${totalDrones}`);

            /* Si todos los drones de este lado estÃ¡n desplegados, iniciar partida */
            if (deployedCount === totalDrones) {
                try {
                    const res = await api.iniciarPartida(localStorage.getItem("partidaId"));
                    console.log('Respuesta iniciarPartida:', res.status, res.statusText);

                    if (!res.ok) {
                        const raw = await res.text();
                        let display = raw;
                        try {
                            const parsed = JSON.parse(raw);
                            if (parsed && typeof parsed === 'object') display = parsed.error || parsed.message || parsed.msg || display;
                        } catch (e) { }
                        console.error('Error en iniciarPartida:', display);
                        showBattleToast(display, "error", 2200);
                        return;
                    }
                    const statusBar = document.getElementById('statusBar');

                    const response = await res.json();
                    console.log('Datos de iniciarPartida:', response);

                    /* Si la partida esta iniciada (ambos bandos desplegados), actualizar botones */
                    if (response.iniciada) {
                        bandosDesplegados = response.bandosDesplegados || 2;
                        turnoActual = response.jugadorEnTurno;

                        updateButtonsVisibility(true);
                        actualizarEstadoTurno();
                    } else {
                        console.log('Esperando segundo jugador. Bandos desplegados:', response.bandosDesplegados);
                        statusDeployWaitingRival();
                    }
                } catch (err) {
                    console.error('Error en la peticion iniciarPartida:', err);
                    showBattleToast("Error de red al iniciar partida.", "error", 2200);
                }
            }

            return;
        }

        const clickedDroneIndex = drones.findIndex((drone) => drone.deployed && drone.vida > 0
            && drone.x === x && drone.y === y);

        if (clickedDroneIndex >= 0) {
            const clickedDrone = drones[clickedDroneIndex];

            // Si estamos en modo recarga, el click sobre un dron propio intenta recargarlo
            if (isReloadMode) {
                await recargarDronElegido(clickedDrone);
                return;
            }
            // Si estamos en modo recarga y no se hizo click en un dron válido
            if (isReloadMode && clickedDroneIndex < 0) {
                showBattleToast("Seleccioná un dron aliado para recargar.", "error");
                return;
            }

            gameState.setActiveDroneById(clickedDrone.id);
            activeDroneId = gameState.activeDroneId;
            isPortaSelected = false;
            drone = getActiveDrone();
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

        // Si no fue un click de seleccion y estamos en modo movimiento, procesar la acciÃ³n.
        if (!esSelec && isMoveMode) {

            if (isPosicionOcupada(x, y)) {
                showBattleToast('Celda ocupada. Elige otra celda', 'error', 2200);
                isMoveMode = false;
                return;
            }

            try {
                let res;
                let hasError = false;
                if (isPortaSelected) {

                    if (!validaPosicionPorta(x, y)) {
                        showBattleToast('Celda fuera del rango de movimiento.', 'error', 2200);
                        isMoveMode = false;
                        return;
                    }

                    res = await api.moverPortadron({
                        partidaId: localStorage.getItem("partidaId"),
                        jugadorId: getId(),
                        x: x,
                        y: y
                    });
                    console.log('Respuesta moverPortadron:', res.status, res.statusText);

                } else {
                    const drone = getActiveDrone();
                    if (!validaPosicion(x, y)) {
                        showBattleToast('Celda fuera del rango de movimiento.', 'error', 2200);
                        isMoveMode = false;
                        return;
                    }

                    if (!drone || !drone.deployed) {
                        showBattleToast('Selecciona un dron para moverlo.', 'error', 2200);
                        isMoveMode = false;
                        return;
                    }
                    if (drone.vida <= 0) {
                        showBattleToast('El dron seleccionado ya no puede moverse.', 'error', 2200);
                        // setupHint.textContent = 'El dron seleccionado ya no puede moverse.';
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
                    // Actualizacion optimista: Mueve la unidad en el cliente para dar feedback visual inmediato.
                    // Lo ideal seri­a que el servidor envi­e el nuevo estado del juego vi­a SSE.
                    moveActiveDroneTo(x, y);
                    saveFogLocally();

                } else {
                    const raw = await res.text();
                    let display = raw;
                    try {
                        const parsed = JSON.parse(raw);
                        if (parsed && typeof parsed === 'object') {
                            display = parsed.error || parsed.message || parsed.msg || display;
                        }
                    } catch (e) {
                        // no-op: raw is not JSON
                    }
                    console.error('Error en moverDron/moverPortadron:', display);
                    showBattleToast(display, 'error', 2200);
                    hasError = true;
                }
            } catch (err) {
                console.error('Error en la peticion de movimiento:', err);
                showBattleToast('Error de red al intentar mover.', 'error', 2200);
            } finally {
                isMoveMode = false;
                updateActionButtonSelection();

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
            showBattleToast("No hay drones desplegados para cambiar.", "error");
            return;
        }

        activeDroneId = gameState.activeDroneId;
        isPortaSelected = false;
        isDeployMode = false;
        isAttackMode = false;
        isMoveMode = false;
        isReloadMode = false;
        updateActionButtonSelection();
        revealAroundActiveDrone();
        updateInfoPanel();
        drawScene();
    });


    // nuevo botÃ³n movimiento
    moveBtn.addEventListener('click', () => {
        const activeDrone = getActiveDrone();
        if (!activeDrone || !activeDrone.deployed || activeDrone.vida <= 0) {
            setupHint.textContent = 'Selecciona un dron vivo para mover.';
            return;
        }
        isMoveMode = true;
        isAttackMode = false;
        isDeployMode = false;
        isReloadMode = false;

        updateActionButtonSelection();
        showBattleToast("Haz click en la celda destino.", "info");
    });

    attackBtn.addEventListener('click', () => {
        const activeDrone = getActiveDrone();
        if (!activeDrone || !activeDrone.deployed) {
            showBattleToast("Seleccioná un dron rival para atacar.", "error");
            return;
        }
        isAttackMode = true;
        isMoveMode = false;
        isReloadMode = false;
        isDeployMode = false;

        updateActionButtonSelection();
        showBattleToast("Seleccioná un objetivo rival para atacar.", "info");
    });

    //Nuevo boton de recargar
    reloadBtn.addEventListener('click', async () => {
        // Si está seleccionado el portadrón, entramos en modo recarga
        if (isPortaSelected) {
            isReloadMode = true;
            isMoveMode = false;
            isAttackMode = false;
            isDeployMode = false;

            updateActionButtonSelection();
            showBattleToast("Seleccioná un dron aliado para recargar.", "info", 2200);
            return;
        }

        const drone = getActiveDrone();
        if (!drone || !drone.deployed) {
            showBattleToast("No hay dron desplegado para recargar.", "error");
            return;
        }

        if (drone.recargas <= 0) {
            showBattleToast("Este dron ya no tiene recargas disponibles.", "error");
            return;
        }

        const maxMunicion = (bandoSeleccionado === "NAVAL") ? 2 : 1;

        if (drone.municion >= maxMunicion) {
            showBattleToast("Este dron ya tiene munición completa.", "error");
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
                const raw = await res.text();
                let display = raw;

                try {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === 'object')
                        display = parsed.error || parsed.message || parsed.msg || display;
                } catch (e) { }

                console.error('Error en recargarDron:', display);
                showBattleToast(display, "error", 2200);

            } else {
                showBattleToast("Recarga exitosa.", "success");
            }

        } catch (err) {
            console.error('Error recargando dron:', err);
        }

        isReloadMode = false;
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
            cols = Math.max(1, Math.floor(canvas.width / cellSize));
            rows = Math.max(1, Math.floor(canvas.height / cellSize));

            /* Recalcular cellSize para que encaje perfectamente */
            cellSize = Math.min(canvas.width / cols, canvas.height / rows);
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

function renderPortaHud(tipoBando) {

    const tipoEl = document.getElementById("portaTipo");
    const vidasEl = document.getElementById("portaVidas");
    if (!tipoEl || !vidasEl) return;

    const esNaval = String(tipoBando || "").toUpperCase() === "NAVAL";
    const maxVidas = esNaval ? 3 : 6;

    tipoEl.textContent = `Portadron ${esNaval ? "Naval" : "Aéreo"}`;

    vidasEl.innerHTML = "";

    for (let i = 0; i < maxVidas; i++) {

        const img = document.createElement("img");
        img.src = "../img/cora_full.png";
        img.style.width = "18px";
        img.style.height = "18px";
        img.style.imageRendering = "pixelated";

        vidasEl.appendChild(img);
    }
}

