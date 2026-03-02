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
            const raw = await res.text();
            let display = raw;
            try {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') display = parsed.error || parsed.message || parsed.msg || display;
            } catch (e) { }
            console.error('Error en asignarBandos:', display);
            setupHint.textContent = display;
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

async function cargarNieblaDescubierta() {
    try {
        const partidaId = localStorage.getItem('partidaId');
        const res = await fetch(`${API_URL}/partida/fog/${partidaId}`);
        if (res.ok) {
            const fog = await res.json();
            if (fog) {
                discovered = JSON.parse(fog);
                drawScene(); // update display
            }
        }
    } catch (err) {
        console.error('Error cargando niebla descubierta:', err);
    }
}

//-----------Actualizar Estado del Turno----------------
function actualizarEstadoTurno() {
    /* Solo mostrar turno si el despliegue ha terminado (ambos bandos desplegados) */
    if (bandosDesplegados < 2) {
        if (typeof turnHint !== 'undefined' && turnHint) {
            turnHint.textContent = "Despliegue en progreso...";
            turnHint.style.color = '#f7e7b2';
        }
        return;
    }

    if (turnoActual === null) {
        if (typeof turnHint !== 'undefined' && turnHint) {
            turnHint.textContent = "Esperando a que comience la partida...";
        }
        return;
    }

    if (turnoActual === currentUserId) {
        if (typeof turnHint !== 'undefined' && turnHint) {
            turnHint.textContent = "Tu turno";
            turnHint.style.color = '#8cff8c';
        }
    } else {
        if (typeof turnHint !== 'undefined' && turnHint) {
            turnHint.textContent = "Turno rival";
            turnHint.style.color = '#ff9a9a';
        }
    }
}

//-----------Modal Salir----------------
function abrirModalSalir() {
    document.getElementById('modalSalir').classList.add('active');
}

function cerrarModalSalir() {
    document.getElementById('modalSalir').classList.remove('active');
}

function abrirModalVictoria(){
    document.getElementById('modalVictoria').classList.add('active');
}

function cerrarMensajeVictoria() {
    document.getElementById('modalVictoria').classList.remove('active');
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

    cerrarMensajeVictoria();
    window.location.href = 'menu.html';
}

async function guardarPartida() {
    const partidaId = localStorage.getItem("partidaId");
    console.log("Guardar partida. partidaId:", partidaId);
    if (!partidaId) return;

    try {
        // convert the booleans matrix to JSON string; the API will store it directly
        const fogJson = JSON.stringify(discovered);
        const res = await api.guardarPartida(partidaId, fogJson);
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
document.getElementById("btnCerrarPartida")?.addEventListener("click", cerrarPartida);


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
        setupHint.textContent = 'Error: usuario no identificado. Vuelve al menú e inicia sesión.';
        return;
    }
    const partidaId = localStorage.getItem('partidaId');
    if (!partidaId) {
        console.warn('No hay partidaId en localStorage');
        setupHint.textContent = 'No se encontró partida. Vuelve al menú y crea/carga una partida.';
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

        // cargar niebla previamente guardada (si existe)
        /* await cargarNieblaDescubierta();*/

        // si la respuesta indica bandos asignados pero los valores son nulos/indefinidos,
        // forzamos la bandera a false para que el usuario pueda volver a elegir.
        if (bandasAsignadas && (!info.bando1 || !info.bando2)) {
            console.warn('Servidor reportó bandosAsignados pero no hay bando1/bando2');
            bandasAsignadas = false;
        }

        isUsuario1 = (currentUserId === usuario1Id);

        console.log('Usuario actual:', currentUserId);
        console.log('Usuario 1:', usuario1Id);
        console.log('Usuario 2:', usuario2Id);
        console.log('Â¿Soy usuario 1?:', isUsuario1);
        console.log('Â¿Bandos asignados?:', bandasAsignadas);

        /* Si soy usuario 1 y aun no hay bandos asignados (o no se conocen), mostrar modal */
        if (isUsuario1 && (!bandasAsignadas || !info.bando1 || !info.bando2)) {
            setTimeout(() => {
                mostrarModalSeleccionarBando();
            }, 500); // PequeÃ±o delay para que se cargue todo primero
        } else if (!isUsuario1 && !bandasAsignadas) {
            /* Si soy usuario 2 y aun no hay bandos, esperar por SSE */
            console.log('Esperando que usuario 1 seleccione bando...');
        } else if (bandasAsignadas) {
            /* Si ya hay bandos asignados, cargar el mi­o */
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

        /* Solo revelar columnas iniciales si los bandos estÃ¡n confirmados */
        if (bandasAsignadas) {
            discovered = Array.from({ length: rows }, () => Array(cols).fill(false));
            revealStartColumnsByBando();
            revealAroundActiveDrone();
            updateInfoPanel();

            /* Si la partida ya estÃ¡ iniciada (ambos bandos desplegados), mostrar botones de acciÃ³n */
            if (info.bandosDesplegados === 2) {
                updateButtonsVisibility(true);
            }

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
            window.location.href = "menu.html";
        }
    });

     eventSource.addEventListener("partida-ganada", (event) => {
        const data = JSON.parse(event.data);
        const gid = String(data.usuarioId);
        const pid = String(data.partidaId);
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
                        if (Array.isArray(info.drones)) hydrateDronesFromServer(info.drones);
                        if (Array.isArray(info.portadrones)) hydratePortadronesFromServer(info.portadrones);
                        revealStartColumnsByBando();
                        revealAroundActiveDrone();
                        updateInfoPanel();
                        updateButtonsVisibility(true);
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
        if (pid === String(currentPartidaId)) {
            window.location.href = "menu.html";
        }
    });

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
        if (info) {
            let changed = false;
            getAllDrones(info.drones);
            drawRivalDrones();
            turnoActual = info.turnoActual;  // Actualizar turnoActual
            actualizarEstadoTurno();
        }
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
        const x = Math.floor((event.clientX - rect.left) / cellSize);
        const y = Math.floor((event.clientY - rect.top) / cellSize);


        if(isInsidePortaArea(x, y, getOwnPorta())) {
            updateButtonByChosen(true);
        }
        const droneIndex = drones.findIndex((drone) => drone.deployed && drone.x === x && drone.y === y);
        if (droneIndex >= 0) {
            updateButtonByChosen(false);
        }

        // si estamos en modo ataque, cualquier click intenta disparar
        if (isAttackMode) {
            let objetivoId = null;
            const atacante = getActiveDrone(); // Ya validado en el listener del botÃ³n de ataque

            if(!validaPosicion(x, y)) {
                setupHint.textContent = 'Celda fuera del rango de ataque.';
                isAttackMode = false;
                return;
            }

            // si se clickea en porta enemigo, objetivo 0 segÃºn backend
            if (isInsidePortaArea(x, y, getEnemyPorta())) {
                objetivoId = 0;
            } else {
                const targetIndex = dronesRivales.findIndex(d => d.deployed && d.x === x && d.y === y);
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
                        setupHint.textContent = display;
                    } else {
                        setupHint.textContent = 'Ataque enviado';
                    }
                } catch (err) {
                    console.error('Error enviando ataque:', err);
                    alert('Error de red al intentar atacar.');
                }
            } else {
                setupHint.textContent = 'Seleccione un objetivo valido para atacar';
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

            if (!isInsideDeploymentZone(x, y)) {
                setupHint.textContent = 'Debes desplegar dentro de tu zona de despliegue';
                return;
            }

            if(isPosicionOcupada(x,y)){
                setupHint.textContent = 'Celda ocupada. Elige otra celda';
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
                    setupHint.textContent = display;
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
                        setupHint.textContent = display;
                        return;
                    }

                    const response = await res.json();
                    console.log('Datos de iniciarPartida:', response);

                    /* Si la partida esta iniciada (ambos bandos desplegados), actualizar botones */
                    if (response.iniciada) {
                        bandosDesplegados = response.bandosDesplegados || 2;  // Actualizar bandosDesplegados
                        console.log('Partida iniciada. Mostrando botones de acciÃ³n.');
                        updateButtonsVisibility(true);
                        if (typeof turnHint !== 'undefined' && turnHint) {
                            if (response.jugadorEnTurno === getId()) {
                                turnHint.textContent = 'Tu turno';
                                turnHint.style.color = '#8cff8c';
                            } else {
                                turnHint.textContent = 'Turno rival';
                                turnHint.style.color = '#ff9a9a';
                            }
                        }
                    } else {
                        console.log('Esperando segundo jugador. Bandos desplegados:', response.bandosDesplegados);
                        setupHint.textContent = 'Despliegue completado. Esperando al bando rival.';
                    }
                } catch (err) {
                    console.error('Error en la peticiÃ³n iniciarPartida:', err);
                    setupHint.textContent = "Error de red al iniciar partida";
                }
            }

            return;
        }

        const clickedDroneIndex = drones.findIndex((drone) => drone.deployed && drone.vida > 0 
        && drone.x === x && drone.y === y);
        if (clickedDroneIndex >= 0) {
            gameState.setActiveDroneById(drones[clickedDroneIndex].id);
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

            if(isPosicionOcupada(x,y)){
                setupHint.textContent = 'Celda ocupada. Elige otra celda';
                isMoveMode = false;
                return;
            }

            try {
                let res;
                let hasError = false;
                if (isPortaSelected) {
                    
                    if(!validaPosicionPorta(x, y)) {
                        setupHint.textContent = 'Celda fuera del rango de movimiento.';
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
                    if(!validaPosicion(x, y)) {
                        setupHint.textContent = 'Celda fuera del rango de movimiento.';
                        isMoveMode = false;
                        return;
                    }

                    if (!drone || !drone.deployed) {
                        setupHint.textContent = 'Selecciona un dron para moverlo.';
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
                    setupHint.textContent = display;  // Mostrar error limpio
                    hasError = true;
                    // alert("Error al mover: " + display);
                }
            } catch (err) {
                console.error('Error en la peticion de movimiento:', err);
                setupHint.textContent = 'Error de red al intentar mover.';
            } finally {
                isMoveMode = false;

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
        setupHint.textContent = `Haz click en el mapa para colocar el dron`;
    });

    // nuevo botÃ³n movimiento
    moveBtn.addEventListener('click', () => {
        isMoveMode = true;
        isAttackMode = false;
        isDeployMode = false;
        setupHint.textContent = 'Haz click en la celda destino';
    });

    // nuevo botÃ³n atacar
    attackBtn.addEventListener('click', () => {
        const activeDrone = getActiveDrone();
        if (!activeDrone || !activeDrone.deployed) {
            setupHint.textContent = 'Selecciona un dron rival para atacar.';
            return;
        }
        isAttackMode = true;
        isMoveMode = false;
        isDeployMode = false;
        setupHint.textContent = 'Selecciona un objetivo';
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
                const raw = await res.text();
                let display = raw;
                try {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === 'object') display = parsed.error || parsed.message || parsed.msg || display;
                } catch (e) { }
                console.error('Error en recargarDron:', display);
                setupHint.textContent = display;
                // alert('Error al recargar: ' + msg);
            } else {
                setupHint.textContent = 'Recarga exitosa';
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
