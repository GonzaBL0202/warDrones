/* Referencias base para dibujar en el lienzo */
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const api = window.PartidaApi;
const gameState = new window.GameState();

/* Configuracion visual principal del tablero */
let cellSize = 32; /* Tamano dinamico de cada celda - se recalcula al ajustar canvas */
const droneSprite = new Image(); /* Sprite sheet del dron */
const dronrivalSprite = new Image(); /* Sprite sheet del dron rival (mismo sprite pero con tintado diferente) */
const portaDronNavalSprite = new Image(); /* Sprite del porta dron naval */
const portaDronAereoSprite = new Image(); /* Sprite del porta dron aereo */
const spriteFps = 10; /* Velocidad de animacion del sprite */

const fogMapImage = new Image();
let fogMapReady = false;

fogMapImage.onload = () => {
    fogMapReady = true;
    drawScene();
};

fogMapImage.src = "../img/fog_map4.png";

const waterTexture = new Image();
let waterReady = false;

waterTexture.onload = () => {
    waterReady = true;
    drawScene();
};

waterTexture.src = "../img/water_map3.png";


/* Referencias del panel lateral (HUD) */
const bandoLabel = document.getElementById('bandoLabel');
// HUD labels removed per user request (info shown on canvas).
const setupHint = document.getElementById('setupHint');
const turnHint = document.getElementById('turnHint');

const fleetList = document.getElementById('fleetList');
const nextDroneBtn = document.getElementById('nextDroneBtn');
const moveBtn = document.getElementById('moveBtn');
const attackBtn = document.getElementById('attackBtn');
const reloadBtn = document.getElementById('reloadBtn');
const modalObjetivoDestruido = document.getElementById('modalObjetivoDestruido');
const killModalTitle = document.getElementById('killModalTitle');
const killModalImage = document.getElementById('killModalImage');
const btnCerrarKillModal = document.getElementById('btnCerrarKillModal');

const bandoGanador = document.getElementById('lblGanador');
const msjAviso = document.getElementById('lblAviso');

/* Modos de acciÃ³n activados por botones */
let isMoveMode = false;      // espera click para mover dron activo
let isAttackMode = false;    // espera seleccionar objetivo para atacar
let isReloadMode = false;    // espera seleccionar un dron aliado para recargar

/* Estado global de visibilidad de botones - una vez que cambio no vuelve a cambiar */
let gameStarted = false;     // true cuando la partida estÃ¡ iniciada por el servidor

/* Info de la partida obtenida del servidor */
let currentUserId = null;    // ID del usuario actual
let usuario1Id = null;       // ID del usuario 1
let usuario2Id = null;       // ID del usuario 2
let isUsuario1 = false;      // true si el usuario actual es el usuario 1
let bandasAsignadas = false; // true si ya se asignaron bandos
let turnoActual = null;      // ID del usuario que tiene el turno actualmente
let bandosDesplegados = 0;   // Cantidad de bandos que han completado despliegue (0, 1, o 2)


const query = new URLSearchParams(window.location.search);
const bandoParam = query.get('bando');
let bandoSeleccionado = bandoParam ? bandoParam.toUpperCase() : null;


let ganador = null;
let fin = null;
let uGuardador = false;

/* Estado global de la partida */
let cols = 0; /* Cantidad de columnas del mapa */
let rows = 0; /* Cantidad de filas del mapa */
let discovered = []; /* Matriz que indica que celdas fueron descubiertas */
let drones = gameState.drones; /* Lista de drones del bando seleccionado */
let dronesRivales = gameState.dronesRivales; /* Lista de drones del bando rival */
let activeDroneId = null; /* Drone actualmente controlado */
let isPortaSelected = false; /* Controla si la unidad activa es el porta dron */
let hoveredDroneId = null; /* Drone previsualizado al pasar el mouse sobre el grid */
let isDeployMode = false; /* Espera click en mapa para colocar dron */
let isMoving = false; /* Evita iniciar otra animacion mientras el jugador se desplaza */
const stepDelayMs = 90; /* Tiempo entre pasos para simular movimiento */
let portadronesHydrated = false;
let dronesHydratedOnce = false;
let portasHydratedOnce = false;

/* Estado interno para animar el sprite por frames */
let spriteReady = false;
let spriteFrameIndex = 0;
let spriteFrameCount = 1;
let spriteFrameSize = 0;
let lastSpriteFrameTime = 0;
let rivalSpriteReady = false;
let rivalSpriteFrameIndex = 0;
let rivalSpriteFrameCount = 1;
let rivalSpriteFrameSize = 0;
let portaDronNavalReady = false;
let portaDronAereoReady = false;
const portaDronNaval = { x: 0, y: 0, size: 2, moveRadius: 2, revealRadius: 2, color: '#4ec5ff', nombre: 'Porta Dron Naval', vida: 3, estado: true };
const portaDronAereo = { x: 0, y: 0, size: 2, moveRadius: 2, revealRadius: 2, color: '#ffd166', nombre: 'Porta Dron Aereo', vida: 6, estado: true };

/* Cuando carga la imagen, calcula tamaï¿½o y numero de frames */
droneSprite.onload = () => {
    /* Asume un sprite horizontal de frames cuadrados */
    spriteFrameSize = droneSprite.height;
    spriteFrameCount = Math.max(1, Math.floor(droneSprite.width / spriteFrameSize));
    spriteReady = true;
};

dronrivalSprite.onload = () => {
    /* Asume un sprite horizontal de frames cuadrados */
    rivalSpriteFrameSize = dronrivalSprite.height;
    rivalSpriteFrameCount = Math.max(1, Math.floor(dronrivalSprite.width / rivalSpriteFrameSize));
    rivalSpriteReady = true;
};


portaDronNavalSprite.onload = () => {
    portaDronNavalReady = true;
    drawScene(); // <-- redibuja apenas carga
};

portaDronAereoSprite.onload = () => {
    portaDronAereoReady = true;
    drawScene(); // <-- redibuja apenas carga
};

/* Devuelve el dron activo segun el indice seleccionado */
function getActiveDrone() {
    return gameState.getActiveDrone();
}

function mapDroneFromServer(droneInfo) {
    const isNaval = droneInfo.bando === 'NAVAL';
    const nombre = isNaval ? 'Naval' : 'Aereo';
    const color = isNaval ? '#4ec5ff' : '#ffd166';
    /* AQUI SE DEFINEN LOS RANGOS DE VISION Y MOVIMIENTO DE CADA DRON SEGUN SU TIPO */
    const moveRadius = isNaval ? 4 : 2;
    const revealRadius = isNaval ? 4 : 2;
    const deployed = droneInfo.vida > 0 && !(droneInfo.posicionX === 0 && droneInfo.posicionY === 0);
    return {
        id: droneInfo.id,
        bando: String(droneInfo.bando || "").toUpperCase(),
        nombre,
        moveRadius,
        revealRadius,
        color,
        deployed,
        vida: droneInfo.vida,
        municion: droneInfo.municion ?? 0,
        x: droneInfo.posicionX,
        y: droneInfo.posicionY
    };
}


function hydrateDronesFromServer(allDrones) {
    // Capturar estado previo ANTES de actualizar
    const prevOwn = drones.map((d) => ({ id: d.id, vida: d.vida, x: d.x, y: d.y, deployed: d.deployed }));
    const prevRival = dronesRivales.map((d) => ({ id: d.id, vida: d.vida, x: d.x, y: d.y, deployed: d.deployed }));

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

    // Solo detectar bajas si ya hubo una hidratación previa (prevOwn tiene datos)
    if (dronesHydratedOnce) {
        ownDrones.forEach((d) => {
            const old = prevOwn.find((o) => o.id === d.id);
            if (old && old.vida > 0 && d.vida <= 0) {
                markCellDiscovered(d.x, d.y);
                abrirModalObjetivoDestruido('DRON', String(d.bando).toUpperCase() === 'NAVAL' ? 'NAVAL' : 'AEREO');
            }
        });

        rivalDrones.forEach((d) => {
            const old = prevRival.find((o) => o.id === d.id);
            if (old && old.vida > 0 && d.vida <= 0) {
                markCellDiscovered(d.x, d.y);
                abrirModalObjetivoDestruido('DRON', String(d.bando).toUpperCase() === 'NAVAL' ? 'NAVAL' : 'AEREO');
            }
        });
    }

    dronesHydratedOnce = true;
}

function hydratePortadronesFromServer(portadrones) {
    (portadrones || []).forEach((porta) => {
        const target = porta.tipo === 'NAVAL' ? portaDronNaval : portaDronAereo;
        const prevVida = target.vida;
        target.x = porta.posicionX;
        target.y = porta.posicionY;
        target.vida = porta.vida;
        target.estado = porta.vida > 0 ? true : false; 
        if (portasHydratedOnce && prevVida > 0 && target.vida <= 0) {
            abrirModalObjetivoDestruido('PORTA', porta.tipo === 'NAVAL' ? 'NAVAL' : 'AEREO');
        }
    });

    portadronesHydrated = true;
    portasHydratedOnce = true;
}

function applyBandoSprite() {
    droneSprite.src = bandoSeleccionado === 'NAVAL'
        ? '../img/dron_naval.png'
        : '../img/dron_aereo.png';

    dronrivalSprite.src = bandoSeleccionado === 'NAVAL'
        ? '../img/dron_aereo.png'
        : '../img/dron_naval.png';
}

function applyPortaSprites() {
    // logs de error si no encuentra el archivo (así lo detectás al toque)
    portaDronNavalSprite.onerror = () => console.error("No cargó Porta_dron_naval.png", portaDronNavalSprite.src);
    portaDronAereoSprite.onerror = () => console.error("No cargó Porta_dron_aereo.png", portaDronAereoSprite.src);

    // IMPORTANTÍSIMO: asignar src (si no, nunca se marca Ready)
    portaDronNavalSprite.src = "../img/Porta_dron_naval.png";
    portaDronAereoSprite.src = "../img/Porta_dron_aereo.png";
}

/* Revela columnas iniciales segun bando */
function revealStartColumnsByBando() {
    const columnsToReveal = Math.max(1, Math.ceil(cols / 3));
    for (let y = 0; y < rows; y++) {
        for (let i = 0; i < columnsToReveal; i++) {
            const x = bandoSeleccionado === 'NAVAL' ? i : (cols - 1 - i);
            discovered[y][x] = true;
        }
    }
}

function getOwnPorta() {
    return bandoSeleccionado === 'NAVAL' ? portaDronNaval : portaDronAereo;
}

function getEnemyPorta() {
    return bandoSeleccionado === 'NAVAL' ? portaDronAereo : portaDronNaval;
}

function positionPortaDronNaval() {
    portaDronNaval.x = 0;
    /* Centrar verticalmente teniendo en cuenta el tamaño del porta */
    portaDronNaval.y = Math.max(0, Math.floor((rows - portaDronNaval.size) / 2));
}

function positionPortaDronAereo() {
    portaDronAereo.x = Math.max(0, cols - portaDronAereo.size);
    /* Centrar verticalmente teniendo en cuenta el tamaño del porta */
    portaDronAereo.y = Math.max(0, Math.floor((rows - portaDronAereo.size) / 2));
}

function isInsidePortaArea(cellX, cellY, porta) {
    return cellX >= porta.x
        && cellX < porta.x + porta.size
        && cellY >= porta.y
        && cellY < porta.y + porta.size;
}

function isInsideAnyPorta(cellX, cellY) {
    return isInsidePortaArea(cellX, cellY, portaDronNaval) || isInsidePortaArea(cellX, cellY, portaDronAereo);
}

function isDroneInPortaArea(x, y, size) {
    return drones.some((d) => d.deployed
        && d.x >= x
        && d.x < x + size
        && d.y >= y
        && d.y < y + size);
}

function overlapsPorta(x, y, size, porta) {
    return x < (porta.x + porta.size)
        && (x + size) > porta.x
        && y < (porta.y + porta.size)
        && (y + size) > porta.y;
}

/* Posiciona los drones al inicio en columnas/filas separadas para que no se solapen */
function positionFleet() {
    const stepY = 2;
    const perColumn = Math.max(1, Math.floor((rows - 2) / stepY));

    for (let i = 0; i < drones.length; i++) {
        const column = Math.floor(i / perColumn);
        const rowIndex = i % perColumn;
        const x = 1 + (column * 2);
        const y = 1 + (rowIndex * stepY);

        /* Limita posiciones para no salir de los bordes del mapa */
        drones[i].x = Math.max(0, Math.min(cols - 1, x));
        drones[i].y = Math.max(0, Math.min(rows - 1, y));
    }
}

function mostrarGanador(ganadorId) {
    const lbl = document.getElementById('lblGanador');
    if (!lbl) return; // evita error si aún no existe en DOM

    let bando;
    console.log("GanadorId: " + ganadorId);
    console.log("Usuario actual: " + getId());
    console.log("Bando: " + bandoSeleccionado)

    if (ganadorId == getId()) {
        bando = bandoSeleccionado;
        console.log("Soy usuario ganador, se carga mi bando: " + bando);
    } else {
        bando = (bandoSeleccionado === "NAVAL") ? "AEREO" : "NAVAL";
        console.log("Soy usuario perdedor, se carga el bando rival: " + bando + ", mi bando era:" + bandoSeleccionado);
    }

    lbl.textContent = `BANDO GANADOR: ${bando}`;
    console.log("Bando ganador final: " + bando);
}

function getId() {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id) : null;
}

function mostrarAviso(msj) {
    const lbl = document.getElementById('lblAviso');
    if (!lbl) return; // evita error si aún no existe en DOM

    lbl.textContent = msj;
}


/* Actualiza textos del panel y reconstruye la lista de drones clickeables */
function updateInfoPanel() {
    if (!bandoSeleccionado) {
        if (fleetList) fleetList.innerHTML = '';
        if (bandoLabel) bandoLabel.textContent = 'Bando: -';
        updateButtonsVisibility(false);
        return;
    }

    const ownPorta = getOwnPorta();
    if (!ownPorta) return;

    // Solo drones del jugador actual
    const misDrones = drones.filter(d =>
        String(d.bando || '').toUpperCase() === String(bandoSeleccionado || '').toUpperCase()
    );

    if (bandoLabel) {
        bandoLabel.textContent = `Bando: ${bandoSeleccionado}`;
    }

    if (setupHint && !gameStarted) {
        if (isDeployMode) {
            setupHint.textContent = 'Selecciona una celda del mapa para desplegar el dron.';
        } else {
            setupHint.textContent = 'Elige un dron para desplegar.';
        }
    }

    // limpiar y reconstruir
    fleetList.innerHTML = '';

    // =========================
    // PORTADRÓN
    // =========================
    const portaItem = document.createElement('button');
    portaItem.type = 'button';
    portaItem.className = 'porta-btn';

    if (!ownPorta.estado) {
        portaItem.classList.add('dead');
    } else {
        portaItem.classList.add('deployed');
    }

    if (isPortaSelected) {
        portaItem.classList.add('active');
    }

    const portaImg = document.createElement('img');
    portaImg.className = 'porta-icon';
    portaImg.src = (String(bandoSeleccionado).toUpperCase() === 'NAVAL')
        ? '../img/Porta_dron_naval.png'
        : '../img/porta_dron_aereo_icon.png';
    portaImg.alt = ownPorta.nombre || 'Portadrón';
    portaImg.draggable = false;

    const portaText = document.createElement('span');
    portaText.textContent = ownPorta.nombre || 'Portadrón';

    portaItem.appendChild(portaImg);
    portaItem.appendChild(portaText);

    portaItem.addEventListener('click', () => {
        if (!ownPorta.estado) return;

        isPortaSelected = true;

        // deseleccionar dron
        activeDroneId = null;
        gameState.activeDroneId = null;

        isDeployMode = false;

        // al volver a seleccionar el portadrón, cancelar modos pendientes
        isReloadMode = false;
        isAttackMode = false;
        isMoveMode = false;
        updateActionButtonSelection();

        revealAroundActiveDrone();
        updateInfoPanel();
        drawScene();

        if (!gameStarted) {
            statusDeployBase();
        }
    });

    fleetList.appendChild(portaItem);

    // =========================
    // DRONES
    // =========================
    misDrones.forEach((d, index) => {
        const dead = (d.vida <= 0) || (d.estado === false);

        const card = document.createElement('div');
        card.className = 'drone-card';

        if (dead) {
            card.classList.add('dead');
        } else if (d.deployed) {
            card.classList.add('deployed');
        } else {
            card.classList.add('reserve');
        }

        if (!dead && d.id === activeDroneId) {
            card.classList.add('active');
        }

        const ico = document.createElement('img');
        ico.className = 'drone-icon';

        const b = String(d.bando || bandoSeleccionado).toUpperCase();
        ico.src = (b === 'NAVAL')
            ? '../img/dron_icon_naval.png'
            : '../img/dron_icon_aereo.png';
        ico.alt = `Icono dron ${index + 1}`;
        ico.draggable = false;

        const meta = document.createElement('div');
        meta.className = 'drone-meta';

        const title = document.createElement('div');
        title.className = 'drone-title';
        title.textContent = `DRON #${index + 1}`;

        const ammoRow = document.createElement('div');
        ammoRow.className = 'drone-ammo';

        const ammoImg = document.createElement('img');
        ammoImg.className = 'ammo-icon';
        ammoImg.src = (b === 'NAVAL')
            ? '../img/m1sil.png'
            : '../img/bomb.png';
        ammoImg.alt = 'Munición';
        ammoImg.draggable = false;

        const ammoText = document.createElement('span');
        ammoText.textContent = `x${dead ? 0 : (d.municion ?? 0)}`;

        ammoRow.appendChild(ammoImg);
        ammoRow.appendChild(ammoText);

        meta.appendChild(title);
        meta.appendChild(ammoRow);

        card.appendChild(ico);
        card.appendChild(meta);

        card.addEventListener('mouseenter', () => {
            if (dead) return;
            hoveredDroneId = d.id;
            drawScene();
        });

        card.addEventListener('mouseleave', () => {
            if (hoveredDroneId === d.id) {
                hoveredDroneId = null;
                drawScene();
            }
        });
        card.addEventListener('click', async () => {
            if (dead) return;

            // Si estamos en modo recarga, el click en el grid recarga ese dron
            if (isReloadMode) {
                await recargarDronElegido(d);
                return;
            }

            gameState.setActiveDroneById(d.id);
            activeDroneId = gameState.activeDroneId;

            // deseleccionar porta
            isPortaSelected = false;

            // al seleccionar un dron, se cancelan modos de acción pendientes
            isReloadMode = false;
            isAttackMode = false;
            isMoveMode = false;
            updateActionButtonSelection();

            if (!gameStarted) {
                if (!d.deployed) {
                    isDeployMode = true;
                    statusDeployPick();
                } else {
                    isDeployMode = false;
                    statusDeployBase();
                }
            }

            revealAroundActiveDrone();
            updateInfoPanel();
            drawScene();
        });

        fleetList.appendChild(card);
    });

    updateActionBarVisibility();
}


/* Actualiza la visibilidad de los botones en funciÃ³n de si la partida estÃ¡ iniciada */
function updateButtonsVisibility(iniciada = false) {
    if (!nextDroneBtn || !moveBtn || !attackBtn || !reloadBtn) return;

    // ocultar todo siempre
    nextDroneBtn.style.display = 'none';
    moveBtn.style.display = 'none';
    attackBtn.style.display = 'none';
    reloadBtn.style.display = 'none';

    if (iniciada) {
        gameStarted = true;
        updateActionBarVisibility();
            actualizarAyudaPartida();

    }
}

function updateActionBarVisibility() {
    if (!nextDroneBtn || !moveBtn || !attackBtn || !reloadBtn) return;

    // antes de que empiece la partida, no mostrar nada
    if (!gameStarted) {
        nextDroneBtn.style.display = 'none';
        moveBtn.style.display = 'none';
        attackBtn.style.display = 'none';
        reloadBtn.style.display = 'none';
        return;
    }

    // reset
    nextDroneBtn.style.display = 'none';
    moveBtn.style.display = 'none';
    attackBtn.style.display = 'none';
    reloadBtn.style.display = 'none';

    // si está seleccionado el portadrón
    if (isPortaSelected) {
        reloadBtn.style.display = 'block';
        moveBtn.style.display = 'block';
        nextDroneBtn.style.display = 'block';
        return;
    }

    // si hay dron activo
    const d = getActiveDrone();
    if (d && d.vida > 0) {
        attackBtn.style.display = 'block';
        moveBtn.style.display = 'block';
        nextDroneBtn.style.display = 'block';
    }
}


function updateButtonByChosen(esPorta) {
    if (esPorta) {
        attackBtn.style.display = 'none';
        reloadBtn.style.display = 'none';
    } else {
        attackBtn.style.display = 'block';
        reloadBtn.style.display = 'block';
    }
}


function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const borderWidth = parseFloat(getComputedStyle(canvas).borderLeftWidth) || 0;

    const FIXED_COLS = 35;
    const FIXED_ROWS = 20;
    cols = FIXED_COLS;
    rows = FIXED_ROWS;

    const availableWidth = rect.width - borderWidth * 2;
    const availableHeight = rect.height - borderWidth * 2;

    cellSize = Math.min(availableWidth / cols, availableHeight / rows);

    // Ajustar canvas exactamente a la grilla — sin píxeles sobrantes
    canvas.width = Math.floor(cellSize * cols);
    canvas.height = Math.floor(cellSize * rows);

    cellSize = Math.min(canvas.width / cols, canvas.height / rows);

    // Preservar discovered al redimensionar
    const prevDiscovered = discovered;
    const prevRows = prevDiscovered.length;
    const prevCols = prevRows > 0 ? prevDiscovered[0].length : 0;

    discovered = Array.from({ length: rows }, (_, y) =>
        Array.from({ length: cols }, (_, x) => {
            if (y < prevRows && x < prevCols) {
                return prevDiscovered[y][x];
            }
            return false;
        })
    );

    revealStartColumnsByBando();
    if (!portadronesHydrated) {
        positionPortaDronNaval();
        positionPortaDronAereo();
    }

    revealAroundActiveDrone();
    updateInfoPanel();
    drawScene();
}


/* Dibuja el fondo del mapa y la grilla t?ctica donde se mover?n
   las unidades (drones) dentro del tablero */
function drawMap() {
    if (waterReady) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(waterTexture, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#24323d';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= cols; x++) {
        const px = x * cellSize;
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, rows * cellSize);
        ctx.stroke();
    }

    for (let y = 0; y <= rows; y++) {
        const py = y * cellSize;
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(cols * cellSize, py);
        ctx.stroke();
    }
}

/* Revela las celdas alrededor del jugador seg?n su radio de visi?n.
   Implementa la l?gica principal del sistema de fog of war */
function revealAroundActiveDrone() {
    let centerX = 0;
    let centerY = 0;
    let revealRadius = 0;

    if (isPortaSelected) {
        const ownPorta = getOwnPorta();
        centerX = ownPorta.x + (ownPorta.size / 2);
        centerY = ownPorta.y + (ownPorta.size / 2);
        revealRadius = ownPorta.revealRadius;
    } else {
        const drone = getActiveDrone();
        if (!drone || !drone.deployed) {
            return;
        }
        centerX = drone.x + 0.5;
        centerY = drone.y + 0.5;
        revealRadius = drone.revealRadius;
    }

    if (revealRadius <= 0) {
        return;
    }

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const dx = (x + 0.5) - centerX;
            const dy = (y + 0.5) - centerY;

            /* Distancia circular (sin ra?z) para rendimiento */
            if ((dx * dx) + (dy * dy) <= revealRadius * revealRadius) {
                discovered[y][x] = true;
            }
        }
    }
}

function revealAroundAllDeployedDrones() {
    // Revelar alrededor del portadrón propio
    const ownPorta = getOwnPorta();
    if (ownPorta) {
        const centerX = ownPorta.x + (ownPorta.size / 2);
        const centerY = ownPorta.y + (ownPorta.size / 2);
        const r = ownPorta.revealRadius;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const dx = (x + 0.5) - centerX;
                const dy = (y + 0.5) - centerY;
                if ((dx * dx) + (dy * dy) <= r * r) discovered[y][x] = true;
            }
        }
    }

    // Revelar alrededor de cada dron desplegado propio
    drones.forEach(drone => {
        if (!drone.deployed || drone.vida <= 0) return;
        const centerX = drone.x + 0.5;
        const centerY = drone.y + 0.5;
        const r = drone.revealRadius;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const dx = (x + 0.5) - centerX;
                const dy = (y + 0.5) - centerY;
                if ((dx * dx) + (dy * dy) <= r * r) discovered[y][x] = true;
            }
        }
    });
}

/* Crear una funcion que utilice la misma logica que revelsa el mapa al rededor del dron, pero para validar su rango de movimiento con respecto a un x,y dado
Esta funcion se puede llamar desde el click del mapa para validar si la celda seleccionada esta dentro del rango de movimiento del dron activo, y mostrar un mensaje de error si no lo esta */
function validaPosicion(x, y) {
    const drone = getActiveDrone();
    if (!drone || !drone.deployed) {
        return false;
    }

    const centerX = drone.x + 0.5;
    const centerY = drone.y + 0.5;
    const dx = (x + 0.5) - centerX;
    const dy = (y + 0.5) - centerY;

    /* Distancia circular (sin ra?z) para rendimiento */
    if ((dx * dx) + (dy * dy) <= drone.moveRadius * drone.moveRadius) {
        return true;
    }
    return false;
}

function validaPosicionPorta(x, y) {
    const ownPorta = getOwnPorta();
    const centerX = ownPorta.x + (ownPorta.size / 2);
    const centerY = ownPorta.y + (ownPorta.size / 2);
    const dx = (x + 0.5) - centerX;
    const dy = (y + 0.5) - centerY;
    const isInsideCircle = (dx * dx) + (dy * dy) <= ownPorta.moveRadius * ownPorta.moveRadius;
    return isInsideCircle;
}

function isPosicionOcupada(x, y) {
    const occupiedByOwnDrones = drones.some((d) => d.deployed && d.x === x && d.y === y && d.vida > 0);
    const occupiedByRivalDrones = dronesRivales.some((d) => d.deployed && d.x === x && d.y === y && d.vida > 0);
    const occupiedByPorta = isInsideAnyPorta(x, y);
    return occupiedByOwnDrones || occupiedByRivalDrones || occupiedByPorta;
}

/* Dibuja la niebla de guerra sobre el mapa.
   Las zonas no descubiertas se oscurecen y las descubiertas se ven parcialmente */
function drawFog() {
    const drone = getActiveDrone();
    const hasDeployedDrone = !!(drone && drone.deployed);
    const hasSelectedPorta = isPortaSelected;
    const ownPorta = getOwnPorta();

    const hasUnit = hasSelectedPorta || hasDeployedDrone;

    const centerX = hasSelectedPorta
        ? (ownPorta.x + (ownPorta.size / 2))
        : (hasDeployedDrone ? (drone.x + 0.5) : 0);

    const centerY = hasSelectedPorta
        ? (ownPorta.y + (ownPorta.size / 2))
        : (hasDeployedDrone ? (drone.y + 0.5) : 0);

    const revealRadius = hasSelectedPorta
        ? ownPorta.revealRadius
        : (hasDeployedDrone ? drone.revealRadius : 0);

    const moveRadius = hasSelectedPorta
        ? ownPorta.moveRadius
        : (hasDeployedDrone ? drone.moveRadius : 0);

    const columnsToReveal = Math.max(1, Math.ceil(cols / 3));

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const dx = hasUnit ? ((x + 0.5) - centerX) : 0;
            const dy = hasUnit ? ((y + 0.5) - centerY) : 0;
            const isInsideCircle = hasUnit && ((dx * dx) + (dy * dy) <= revealRadius * revealRadius);

            const isInitialRevealZone = (bandoSeleccionado === 'NAVAL')
                ? (x < columnsToReveal)
                : (x >= cols - columnsToReveal);

            if (isInsideCircle || isInitialRevealZone) {
                continue;
            }

            const px = x * cellSize;
            const py = y * cellSize;
            const yaDescubierta = discovered[y][x];

            ctx.save();

            ctx.fillStyle = yaDescubierta
                ? 'rgba(0, 0, 0, 0.28)'
                : 'rgba(0, 0, 0, 0.52)';
            ctx.fillRect(px, py, cellSize, cellSize);

            if (fogMapReady) {
                const sx = (x / cols) * fogMapImage.width;
                const sy = (y / rows) * fogMapImage.height;
                const sw = fogMapImage.width / cols;
                const sh = fogMapImage.height / rows;

                ctx.globalAlpha = yaDescubierta ? 0 : 1;
                ctx.imageSmoothingEnabled = false;

                ctx.drawImage(
                    fogMapImage,
                    sx, sy, sw, sh,
                    px, py, cellSize, cellSize
                );
            }

            ctx.restore();
        }
    }

    const maxVisibleWidth = cols * cellSize;
    const maxVisibleHeight = rows * cellSize;

    /* Cubrir el Ã¡rea a la derecha si no alcanza a llenar toda la anchura */
    if (maxVisibleWidth < canvas.width) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(maxVisibleWidth, 0, canvas.width - maxVisibleWidth, canvas.height);
    }

    /* Cubrir el Ã¡rea abajo si no alcanza a llenar toda la altura */
    if (maxVisibleHeight < canvas.height) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, maxVisibleHeight, canvas.width, canvas.height - maxVisibleHeight);
    }

    if (hasUnit) {
        const px = centerX * cellSize;
        const py = centerY * cellSize;
        const outlineRadiusPx = moveRadius * cellSize;

        ctx.save();
        ctx.strokeStyle = 'rgba(242, 203, 103, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, outlineRadiusPx, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

function drawRecoveredFog() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {

            if (!discovered[y][x]) {
                ctx.fillStyle = 'rgba(0,0,0,0.9)';
            } else {
                ctx.fillStyle = 'rgba(0,0,0,0.35)';
            }

            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

/* Dibuja todos los drones en el tablero.
   Usa sprite animado si est? cargado, o un c?rculo de respaldo si no */
function drawSinglePortaDron(porta, sprite, spriteReady, isSelected) {
    const px = porta.x * cellSize;
    const py = porta.y * cellSize;
    const sizePx = porta.size * cellSize;

    // si está muerto no se dibuja
    if (!porta.estado) {
        markCellDiscovered(porta.x, porta.y);
        markCellDiscovered(porta.x + 1, porta.y);
        markCellDiscovered(porta.x, porta.y + 1);
        markCellDiscovered(porta.x + 1, porta.y + 1);
    }

    if (spriteReady) {
        /* Si la imagen es un sprite sheet horizontal, usa solo el primer frame cuadrado */
        const frameSize = sprite.height;
        const useSheet = sprite.width > sprite.height;
        const sx = 0;
        const sy = 0;
        const sw = useSheet ? frameSize : sprite.width;
        const sh = useSheet ? frameSize : sprite.height;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            sprite,
            sx,
            sy,
            sw,
            sh,
            px,
            py,
            sizePx,
            sizePx
        );
    } else {
        ctx.fillStyle = '#7bb3ff';
        ctx.fillRect(px, py, sizePx, sizePx);
    }

    if (isSelected) {
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(px + 1, py + 1, sizePx - 2, sizePx - 2);
        ctx.restore();
    }
}

function drawPortaDrones() {
    const ownPorta = getOwnPorta();
    drawSinglePortaDron(portaDronNaval, portaDronNavalSprite, portaDronNavalReady, isPortaSelected && ownPorta === portaDronNaval);
    drawSinglePortaDron(portaDronAereo, portaDronAereoSprite, portaDronAereoReady, isPortaSelected && ownPorta === portaDronAereo);
}

function markCellDiscovered(x, y) {
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
        discovered[y][x] = true;
    }
}


function drawDrones() {
    for (let i = 0; i < drones.length; i++) {
        const drone = drones[i];

        // si está muerto o no desplegado no se dibuja
        if (drone.vida <= 0 || !drone.deployed) {
            if (drone.vida <= 0) {
                markCellDiscovered(drone.x, drone.y);
            }
            continue;
        }

        const px = (drone.x + 0.5) * cellSize;
        const py = (drone.y + 0.5) * cellSize;
        const size = Math.floor(cellSize * 1.05);
        const half = size / 2;

        if (spriteReady) {
            const sx = spriteFrameIndex * spriteFrameSize;
            const sy = 0;

            /* Pixel-art: evita suavizado para que no se vea borroso */
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
                droneSprite,
                sx,
                sy,
                spriteFrameSize,
                spriteFrameSize,
                px - half,
                py - half,
                size,
                size
            );
        } else {
            ctx.fillStyle = '#f2cb67';
            ctx.beginPath();
            ctx.arc(px, py, Math.max(10, Math.floor(cellSize * 0.35)), 0, Math.PI * 2);
            ctx.fill();
        }

        const isActive = drone.id === activeDroneId;
        const isHovered = drone.id === hoveredDroneId;

        ctx.save();

        // círculo más fuerte para hover
        ctx.lineWidth = isActive ? 3 : (isHovered ? 4 : 2);

        // color más brillante
        ctx.strokeStyle = isActive
            ? '#ffffff'
            : (isHovered ? '#fff3b0' : drone.color);

        ctx.beginPath();
        ctx.arc(px, py, Math.max(12, Math.floor(cellSize * 0.46)), 0, Math.PI * 2);
        ctx.stroke();

        // pequeño glow para hover
        if (isHovered && !isActive) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255,255,255,0.35)';
            ctx.beginPath();
            ctx.arc(px, py, Math.max(14, Math.floor(cellSize * 0.52)), 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }
}

function drawRivalDrones() {
    for (let i = 0; i < dronesRivales.length; i++) {
        const drone = dronesRivales[i];

        if (drone.vida <= 0 || !drone.deployed) {
            if (drone.vida <= 0) {
                markCellDiscovered(drone.x, drone.y);
            }
            continue;
        }

        const px = (drone.x + 0.5) * cellSize;
        const py = (drone.y + 0.5) * cellSize;
        const size = Math.floor(cellSize * 1.05);
        const half = size / 2;

        if (rivalSpriteReady) {
            const sx = rivalSpriteFrameIndex * rivalSpriteFrameSize;
            const sy = 0;

            /* Pixel-art: evita suavizado para que no se vea borroso */
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
                dronrivalSprite,
                sx,
                sy,
                rivalSpriteFrameSize,
                rivalSpriteFrameSize,
                px - half,
                py - half,
                size,
                size
            );
        } else {
            ctx.fillStyle = '#f2cb67';
            ctx.beginPath();
            ctx.arc(px, py, Math.max(10, Math.floor(cellSize * 0.35)), 0, Math.PI * 2);
            ctx.fill();
        }

        if (!discovered[drone.y][drone.x]) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.beginPath();
            ctx.arc(px, py, Math.max(10, Math.floor(cellSize * 0.35)), 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

/* Renderiza toda la escena en el orden correcto:
   primero el mapa, luego la niebla de guerra y finalmente los drones */
function drawScene() {
    drawMap();
    drawPortaDrones();
    drawDrones();
    drawRivalDrones();
    drawFog();
}

/* Loop de render para mantener la animacion del sprite constantemente */
function gameLoop(timestamp) {
    if (spriteReady) {
        if (!lastSpriteFrameTime) {
            lastSpriteFrameTime = timestamp;
        }

        const frameDuration = 1000 / spriteFps;
        if (timestamp - lastSpriteFrameTime >= frameDuration) {
            spriteFrameIndex = (spriteFrameIndex + 1) % spriteFrameCount;
            lastSpriteFrameTime = timestamp;
        }
    }

    drawScene();
    requestAnimationFrame(gameLoop);
}

/* Mueve al dron activo con desplazamientos (dx, dy).
   Esta funcion sirve para controles por teclado u otras entradas */
function moveActiveDrone(dx, dy) {
    if (isPortaSelected) {
        const ownPorta = getOwnPorta();
        const enemyPorta = getEnemyPorta();
        const newX = Math.min(cols - ownPorta.size, Math.max(0, ownPorta.x + dx));
        const newY = Math.min(rows - ownPorta.size, Math.max(0, ownPorta.y + dy));
        if ((newX === ownPorta.x && newY === ownPorta.y)
            || isDroneInPortaArea(newX, newY, ownPorta.size)
            || overlapsPorta(newX, newY, ownPorta.size, enemyPorta)) {
            return;
        }
        ownPorta.x = newX;
        ownPorta.y = newY;
        revealAroundActiveDrone();
        drawScene();
        return;
    }

    const drone = getActiveDrone();
    if (!drone || !drone.deployed) {
        return;
    }

    const newX = Math.min(cols - 1, Math.max(0, drone.x + dx));
    const newY = Math.min(rows - 1, Math.max(0, drone.y + dy));

    if (newX === drone.x && newY === drone.y) {
        return;
    }
    if (isInsideAnyPorta(newX, newY)) {
        return;
    }

    drone.x = newX;
    drone.y = newY;
    revealAroundActiveDrone();
    drawScene();
}

//Animaciones

function cerrarModalObjetivoDestruido() {
    const modal = document.getElementById("modalObjetivoDestruido");
    if (modal) modal.classList.add("oculto");
}

function getKillModalImageSrc(tipoObjetivo, subtipoObjetivo) {
    const defaults = {
        DRON_NAVAL: '../img/dronNavalAnimacionDestruidoGIF.gif',
        DRON_AEREO: '../img/animacionDronAereoDestruidGIF.gif',
        PORTA_NAVAL: '../img/animacionNaval_explocionGIF.gif',
        PORTA_AEREO: '../img/AnimacionPortadronAereoDestruidoGIF.gif',
        DEFAULT: '../img/DronExplotando.png'
    };

    const override = (window.KILL_TARGET_IMAGES && typeof window.KILL_TARGET_IMAGES === 'object')
        ? window.KILL_TARGET_IMAGES
        : {};

    const key = `${tipoObjetivo}_${subtipoObjetivo}`;
    return override[key] || defaults[key] || override.DEFAULT || defaults.DEFAULT;
}


if (btnCerrarKillModal) {
    btnCerrarKillModal.addEventListener('click', cerrarModalObjetivoDestruido);
}

//Animaciones

function getKillModalImageSrc(tipoObjetivo, subtipoObjetivo) {
    const defaults = {
        DRON_NAVAL: '../img/dronNavalAnimacionDestruidoGIF.gif',
        DRON_AEREO: '../img/animacionDronAereoDestruidGIF.gif',
        PORTA_NAVAL: '../img/animacionNaval_explocionGIF.gif',
        PORTA_AEREO: '../img/AnimacionPortadronAereoDestruidoGIF.gif',
        DEFAULT: '../img/DronExplotando.png'
    };

    const override = (window.KILL_TARGET_IMAGES && typeof window.KILL_TARGET_IMAGES === 'object')
        ? window.KILL_TARGET_IMAGES
        : {};

    const key = `${tipoObjetivo}_${subtipoObjetivo}`;
    return override[key] || defaults[key] || override.DEFAULT || defaults.DEFAULT;
}

function abrirModalObjetivoDestruido(tipoObjetivo, subtipoObjetivo) {
    const modal = document.getElementById("modalObjetivoDestruido");
    if (!modal) return;

    const tipo = (subtipoObjetivo === 'NAVAL') ? 'naval' : 'aereo';
    const texto = tipoObjetivo === 'PORTA'
        ? `Porta dron ${tipo} destruido`
        : `Dron ${tipo} destruido`;

    if (killModalTitle) killModalTitle.textContent = texto;

    if (killModalImage) {
        const baseSrc = getKillModalImageSrc(tipoObjetivo, subtipoObjetivo);
        const cacheBuster = `v=${Date.now()}`;
        const separator = baseSrc.includes('?') ? '&' : '?';
        killModalImage.src = '';
        killModalImage.src = `${baseSrc}${separator}${cacheBuster}`;
    }

    modal.classList.remove("oculto");
}

if (btnCerrarKillModal) {
    btnCerrarKillModal.addEventListener('click', cerrarModalObjetivoDestruido);
}

const partidaId = localStorage.getItem("partidaId");

if (partidaId) {
    const titulo = document.getElementById("tituloPartida");
    if (titulo) {
        titulo.textContent = "";
    }
}

function abrirModalEsperandoBando() {
    const modal = document.getElementById("modalEsperandoBando");
    if (modal) modal.classList.remove("oculto");
}

function cerrarModalEsperandoBando() {
    const modal = document.getElementById("modalEsperandoBando");
    if (modal) modal.classList.add("oculto");
}

function actualizarVidaPortadron(vidaActual, vidaMax) {

    const vidasEl = document.getElementById("portaVidas");
    if (!vidasEl) return;

    vidasEl.innerHTML = "";

    for (let i = 0; i < vidaMax; i++) {

        const img = document.createElement("img");

        img.src = (i < vidaActual)
            ? "../img/cora_full.png"
            : "../img/cora_empty.png";

        img.style.width = "16px";
        img.style.imageRendering = "pixelated";

        vidasEl.appendChild(img);
    }
}


function setStatusBar(titulo, descripcion = "") {
    const el = document.getElementById("statusBar");
    if (!el) return;

    el.innerHTML = `
        <div class="status-chip">
            <span class="status-chip-label">${titulo}</span>
            <span class="status-chip-value">${descripcion}</span>
        </div>
    `;
}


function statusDeployBase() {
    setStatusBar(
        "DESPLIEGUE DE DRONES:",
        "seleccioná un dron y hacé click en el mapa para colocarlo."
    );
}

function statusDeployPick() {
    setStatusBar(
        "DESPLIEGUE DE DRONES:",
        "Haz click en el mapa para colocar el dron."
    );
}

function statusDeployWaitingRival() {
    setStatusBar(
        "DESPLIEGUE COMPLETO.",
        "Esperando al rival para comenzar."
    );
}

function statusBattleTurn() {
    renderBattleStatusBar();
}

function renderBattleStatusBar() {
    const el = document.getElementById("statusBar");
    if (!el) return;
    if (bandosDesplegados < 2) return;

    const esMiTurno = Number(turnoActual) === Number(currentUserId);
    const textoTurno = esMiTurno ? "Tu turno" : "Turno rival";

    const portaRival = getEnemyPorta();
    const vidaRival = Math.max(0, Number(portaRival?.vida ?? 0));
    const vidaMaxRival = String(bandoSeleccionado).toUpperCase() === "NAVAL" ? 6 : 3;

    const rivalIconSrc = String(bandoSeleccionado).toUpperCase() === "NAVAL"
        ? "../img/porta_dron_aereo_icon.png"
        : "../img/Porta_dron_naval.png";

    let corazonesHtml = "";
    for (let i = 0; i < vidaMaxRival; i++) {
        const heartSrc = i < vidaRival
            ? "../img/cora_full.png"
            : "../img/cora_empty.png";

        corazonesHtml += `<img class="status-chip-heart" src="${heartSrc}" alt="vida rival">`;
    }

    const dronesRivalesVivos = dronesRivales.filter(d => d.vida > 0).length;
    const totalDronesRivales = dronesRivales.length;
    const rivalDroneIconSrc = String(bandoSeleccionado).toUpperCase() === "NAVAL"
        ? "../img/dron_icon_aereo.png"
        : "../img/dron_icon_naval.png";

    el.innerHTML = `
        <div class="status-chip">
            <span class="status-chip-label">TURNO:</span>
            <span class="status-chip-value">${textoTurno}</span>
        </div>

        <div class="status-chip">
            <img class="status-chip-porta-icon" src="${rivalIconSrc}" alt="Portadrón rival">
            <span class="status-chip-label">RIVAL:</span>
            <span class="status-chip-hearts">${corazonesHtml}</span>
        </div>

        <div class="status-chip">
    <img class="status-chip-drone-icon" src="${rivalDroneIconSrc}" alt="Dron rival">
    <span class="status-chip-label">DRONES RIVAL:</span>
    <span class="status-chip-value">${dronesRivalesVivos}/${totalDronesRivales}</span>
</div>
    `;
}

let battleToastTimeout = null;

function showBattleToast(message, type = "info", duration = 1800) {
    const container = document.getElementById("battleToast");
    if (!container) return;

    if (battleToastTimeout) {
        clearTimeout(battleToastTimeout);
        battleToastTimeout = null;
    }

    container.innerHTML = `
        <div class="battle-toast ${type}">
            ${message}
        </div>
    `;

    const toast = container.querySelector(".battle-toast");
    if (!toast) return;

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    battleToastTimeout = setTimeout(() => {
        toast.classList.remove("show");

        setTimeout(() => {
            if (container.contains(toast)) {
                container.innerHTML = "";
            }
        }, 180);
    }, duration);
}

function clearActionButtonSelection() {
    attackBtn?.classList.remove('action-selected');
    moveBtn?.classList.remove('action-selected');
    reloadBtn?.classList.remove('action-selected');
}

function updateActionButtonSelection() {
    clearActionButtonSelection();

    if (isAttackMode) {
        attackBtn?.classList.add('action-selected');
        return;
    }

    if (isMoveMode) {
        moveBtn?.classList.add('action-selected');
        return;
    }

    if (isReloadMode) {
        reloadBtn?.classList.add('action-selected');
    }
}

async function recargarDronElegido(drone) {
    if (!drone) {
        showBattleToast("Seleccioná un dron.", "error");
        return;
    }

    if (!drone.deployed) {
        showBattleToast("Ese dron aún no está desplegado.", "error");
        return;
    }

    if (drone.vida <= 0) {
        showBattleToast("No puedes recargar un dron destruido.", "error");
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
                if (parsed && typeof parsed === 'object') {
                    display = parsed.error || parsed.message || parsed.msg || display;
                }
            } catch (e) { }

            console.error('Error en recargarDron:', display);
            showBattleToast(display, "error", 2200);
            return;
        }

        showBattleToast("Recarga exitosa.", "success");

        isReloadMode = false;
        isAttackMode = false;
        isMoveMode = false;
        updateActionButtonSelection();

    } catch (err) {
        console.error('Error recargando dron:', err);
        showBattleToast("Error de red al recargar.", "error");
    }
}

//funciones para no perder discovered al recargar pagina

function saveFogLocally() {
    const key = `fog_${localStorage.getItem('partidaId')}_${localStorage.getItem('userId')}`;
    localStorage.setItem(key, JSON.stringify(discovered));
}

function loadFogLocally() {
    const key = `fog_${localStorage.getItem('partidaId')}_${localStorage.getItem('userId')}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
}

function actualizarAyudaPartida() {
    if (typeof Help === "undefined") return;

    // AYUDA DURANTE DESPLIEGUE
    if (!gameStarted) {
        Help.init({
            title: "Despliegue de drones",
            items: [
                "Seleccioná un dron en el panel izquierdo.",
                "Hacé clic en una casilla válida del mapa para colocarlo.",
                "No podés colocar dos unidades en la misma casilla.",
                "Desplegá todos tus drones para comenzar la batalla."
            ]
        });
        return;
    }

    // AYUDA DURANTE LA PARTIDA
    Help.init({
        title: "Cómo jugar",
        items: [
            "Seleccioná un dron o tu portadrones.",
            "Usá los botones disponibles según la unidad seleccionada.",
            "Mover: desplaza la unidad a una casilla válida.",
            "Atacar: elegí un objetivo enemigo dentro del alcance.",
            "Recargar: repone munición si la unidad lo permite.",
            "Protegé tu portadrones y destruí al rival para ganar."
        ]
    });
}