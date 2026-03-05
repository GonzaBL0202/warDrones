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

/* Referencias del panel lateral (HUD) */
const bandoLabel = document.getElementById('bandoLabel');
// HUD labels removed per user request (info shown on canvas).
const setupHint = document.getElementById('setupHint');
const turnHint = document.getElementById('turnHint');
const deployDroneBtn = document.getElementById('deployDroneBtn');
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
// recarga no necesita modo separado, se lanza desde el botÃ³n

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


/* Lee el parametro "bando" desde la URL y lo normaliza */
const query = new URLSearchParams(window.location.search);
let bandoSeleccionado = ((query.get('bando') || 'aereo').toUpperCase() === 'NAVAL') ? 'NAVAL' : 'AEREO';

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


/* Carga de sprites */
portaDronNavalSprite.onload = () => {
    portaDronNavalReady = true;
};
portaDronAereoSprite.onload = () => {
    portaDronAereoReady = true;
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
    const deployed = !(droneInfo.posicionX === 0 && droneInfo.posicionY === 0);
    return {
        id: droneInfo.id,
        nombre,
        moveRadius,
        revealRadius,
        color,
        deployed,
        vida: droneInfo.vida,
        x: droneInfo.posicionX,
        y: droneInfo.posicionY
    };
}


function hydrateDronesFromServer(allDrones) {
    /* conservar copia previa para detectar cambios de vida*/
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

    // detectar bajas y forzar celda descubierta / retirar despliegue
    ownDrones.forEach((d) => {
        const old = prevOwn.find((o) => o.id === d.id);
        if (old && old.vida > 0 && d.vida <= 0) {
            markCellDiscovered(d.x, d.y);
            d.deployed = false;
            abrirModalObjetivoDestruido('DRON', d.nombre && d.nombre.toUpperCase() === 'NAVAL' ? 'NAVAL' : 'AEREO');
        }
    });
    rivalDrones.forEach((d) => {
        const old = prevRival.find((o) => o.id === d.id);
        if (old && old.vida > 0 && d.vida <= 0) {
            markCellDiscovered(d.x, d.y);
            d.deployed = false;
            abrirModalObjetivoDestruido('DRON', d.nombre && d.nombre.toUpperCase() === 'NAVAL' ? 'NAVAL' : 'AEREO');
        }
    });

    dronesHydratedOnce = true;
}

function hydratePortadronesFromServer(portadrones) {
    (portadrones || []).forEach((porta) => {
        const target = porta.tipo === 'NAVAL' ? portaDronNaval : portaDronAereo;
        const prevVida = target.vida;
        target.x = porta.posicionX;
        target.y = porta.posicionY;
        target.vida = porta.vida
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

 function getId() {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id) : null;
}

/* Actualiza textos del panel y reconstruye la lista de drones clickeables */
function updateInfoPanel() {
    const drone = getActiveDrone();
    const ownPorta = getOwnPorta();
    bandoLabel.textContent = `Bando: ${bandoSeleccionado}`;
    // Info de dron desplegada directamente en canvas; no actualizar labels.

    if (!isDeployMode) {
        setupHint.textContent = 'Elige un dron y pulsa Desplegar.';
    }

    /* Actualizar visibilidad de botones solo si la partida aÃºn no ha iniciado */
    if (!gameStarted) {
        updateButtonsVisibility();
    }

    /* Limpia y vuelve a crear la lista para reflejar seleccion actual */
    fleetList.innerHTML = '';
    const portaItem = document.createElement('button');
    portaItem.type = 'button';
    portaItem.textContent = `${ownPorta.nombre}`;
    portaItem.style.width = '100%';
    portaItem.style.textAlign = 'left';
    portaItem.style.padding = '4px 6px';
    portaItem.style.border = '1px solid #6a4a1c';
    portaItem.style.background = isPortaSelected ? 'rgba(78, 197, 255, 0.3)' : 'rgba(15, 25, 30, 0.55)';
    portaItem.style.color = '#f7e7b2';
    portaItem.style.cursor = 'pointer';
    portaItem.addEventListener('click', () => {
        isPortaSelected = true;
        isDeployMode = false;
        revealAroundActiveDrone();
        updateInfoPanel();
        drawScene();
    });
    fleetList.appendChild(portaItem);

    for (let i = 0; i < drones.length; i++) {
        const d = drones[i];
        const item = document.createElement('button');
        item.type = 'button';
        item.textContent = `#${i} ${d.nombre} | ${d.deployed ? 'Desplegado' : 'Reserva'}`;
        item.textContent = d.vida <= 0 ? ` #${i} ${d.nombre} | Explotado` : item.textContent;
        item.style.width = '100%';
        item.style.textAlign = 'left';
        item.style.padding = '4px 6px';
        item.style.border = '1px solid #6a4a1c';
        item.style.background = d.id === activeDroneId ? 'rgba(242, 203, 103, 0.25)' : 'rgba(15, 25, 30, 0.55)';
        item.style.color = '#f7e7b2';
        item.style.cursor = 'pointer';

        /* Al hacer click en un dron de la lista, si esta vivo, lo activa */
        item.addEventListener('click', () => {
            if (d.vida <= 0) return; // No permitir seleccionar drones explotados
            gameState.setActiveDroneById(d.id);
            activeDroneId = gameState.activeDroneId;
            isPortaSelected = false;
            isDeployMode = false;
            revealAroundActiveDrone();
            updateInfoPanel();
            drawScene();
        });

        fleetList.appendChild(item);
    }
}

/* Actualiza la visibilidad de los botones en funciÃ³n de si la partida estÃ¡ iniciada */
function updateButtonsVisibility(iniciada = false) {
    /* Si la partida estÃ¡ iniciada por el servidor, mostrar botones de acciÃ³n */
    if (iniciada) {
        /* En fase de juego: ocultar "Desplegar Dron" y mostrar acciones */
        deployDroneBtn.style.display = 'none';
        nextDroneBtn.style.display = 'block';
        moveBtn.style.display = 'block';
        attackBtn.style.display = 'block';
        reloadBtn.style.display = 'block';

        /* Marcar que la partida ha iniciado para evitar cambios posteriores */
        gameStarted = true;
    } else {
        /* En fase de despliegue: mostrar solo "Desplegar Dron" y "Cambiar Dron" */
        deployDroneBtn.style.display = 'block';
        nextDroneBtn.style.display = 'block';
        moveBtn.style.display = 'none';
        attackBtn.style.display = 'none';
        reloadBtn.style.display = 'none';
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

/* Ajusta el tamano interno del canvas al tamano visual,
   calcula filas y columnas segun la grilla,
   reinicia la niebla de guerra, centra al jugador
   y redibuja toda la escena */

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);

    // Fijar número de columnas y filas (por ejemplo, 20x20)
    const FIXED_COLS = 35;
    const FIXED_ROWS = 20;
    cols = FIXED_COLS;
    rows = FIXED_ROWS;

    // Ajustar cellSize para que la grilla ocupe todo el canvas
    cellSize = Math.min(canvas.width / cols, canvas.height / rows);

    // La matriz discovered debe tener el tamaño fijo
    discovered = Array.from({ length: rows }, () => Array(cols).fill(false));
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
    ctx.fillStyle = '#24323d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    /* Dibuja las líneas verticales de la grilla */
    for (let x = 0; x <= canvas.width; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    /* Dibuja las líneas horizontales de la grilla */
    for (let y = 0; y <= canvas.height; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
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
    const revealRadius = hasSelectedPorta ? ownPorta.revealRadius : (hasDeployedDrone ? drone.revealRadius : 0);
    const moveRadius = hasSelectedPorta ? ownPorta.moveRadius : (hasDeployedDrone ? drone.moveRadius : 0);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const dx = hasUnit ? ((x + 0.5) - centerX) : 0;
            const dy = hasUnit ? ((y + 0.5) - centerY) : 0;
            const isInsideCircle = hasUnit && ((dx * dx) + (dy * dy) <= revealRadius * revealRadius);

            if (isInsideCircle) {
                continue;
            }

            /* Celda ya vista = sombra suave; nunca vista = sombra fuerte */
            ctx.fillStyle = discovered[y][x] ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.9)';

            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }

    /* Cubrir el resto del canvas que no alcanza perfectamente a ser una Ãºltima fila/columna completa */
    const maxVisibleWidth = cols * cellSize;
    const maxVisibleHeight = rows * cellSize;

    // /* Cubrir el Ã¡rea a la derecha si no alcanza a llenar toda la anchura */
    // if (maxVisibleWidth < canvas.width) {
    //     ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    //     ctx.fillRect(maxVisibleWidth, 0, canvas.width - maxVisibleWidth, canvas.height);
    // }

    // /* Cubrir el Ã¡rea abajo si no alcanza a llenar toda la altura */
    // if (maxVisibleHeight < canvas.height) {
    //     ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    //     ctx.fillRect(0, maxVisibleHeight, canvas.width, canvas.height - maxVisibleHeight);
    // }

    /* Centro y radio del lÃ­mite de movimiento del dron activo */
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
        markCellDiscovered(porta.x+1, porta.y);
        markCellDiscovered(porta.x, porta.y+1);
        markCellDiscovered(porta.x+1, porta.y+1);
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

        ctx.save();
        ctx.lineWidth = drone.id === activeDroneId ? 3 : 2;
        ctx.strokeStyle = drone.id === activeDroneId ? '#ffffff' : drone.color;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(12, Math.floor(cellSize * 0.42)), 0, Math.PI * 2);
        ctx.stroke();
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
    if (!modalObjetivoDestruido) return;
    modalObjetivoDestruido.classList.remove('active');
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

function abrirModalObjetivoDestruido(tipoObjetivo, subtipoObjetivo) {
    if (!modalObjetivoDestruido) return;

    const tipo = (subtipoObjetivo === 'NAVAL') ? 'naval' : 'aereo';
    const texto = tipoObjetivo === 'PORTA'
        ? `Porta dron ${tipo} destruido`
        : `Dron ${tipo} destruido`;

    if (killModalTitle) {
        killModalTitle.textContent = texto;
    }
    if (killModalImage) {
        // Forzar reinicio de GIF en cada apertura del modal
        const baseSrc = getKillModalImageSrc(tipoObjetivo, subtipoObjetivo);
        const cacheBuster = `v=${Date.now()}`;
        const separator = baseSrc.includes('?') ? '&' : '?';
        killModalImage.src = '';
        killModalImage.src = `${baseSrc}${separator}${cacheBuster}`;
    }

    modalObjetivoDestruido.classList.add('active');
}

if (btnCerrarKillModal) {
    btnCerrarKillModal.addEventListener('click', cerrarModalObjetivoDestruido);
}

