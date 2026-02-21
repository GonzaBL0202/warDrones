/* Referencias base para dibujar en el lienzo */
        const canvas = document.getElementById('mapCanvas');
        const ctx = canvas.getContext('2d');

        /* Configuracion visual principal del tablero */
        const grid = 32; /* Tamano de cada celda de la grilla del mapa */
        const droneSprite = new Image(); /* Sprite sheet del dron */
        const portaDronNavalSprite = new Image(); /* Sprite del porta dron naval */
        const portaDronAereoSprite = new Image(); /* Sprite del porta dron aereo */
        const spriteFps = 10; /* Velocidad de animacion del sprite */

        /* Referencias del panel lateral (HUD) */
        const bandoLabel = document.getElementById('bandoLabel');
        const droneTypeLabel = document.getElementById('droneTypeLabel');
        const droneRangeLabel = document.getElementById('droneRangeLabel');
        const droneVisionLabel = document.getElementById('droneVisionLabel');
        const setupHint = document.getElementById('setupHint');
        const deployDroneBtn = document.getElementById('deployDroneBtn');
        const fleetList = document.getElementById('fleetList');
        const nextDroneBtn = document.getElementById('nextDroneBtn');

        /* Definicion de tipos de dron por bando */
        const DRONE_SETUP = {
            NAVAL: { cantidad: 6, nombre: 'Dron Naval', moveRadius: 2, revealRadius: 2, color: '#4ec5ff' },
            AEREO: { cantidad: 12, nombre: 'Dron Aereo', moveRadius: 2, revealRadius: 2, color: '#ffd166' }
        };

        /* Lee el parametro "bando" desde la URL y lo normaliza */
        const query = new URLSearchParams(window.location.search);
        const bandoSeleccionado = ((query.get('bando') || 'aereo').toUpperCase() === 'NAVAL') ? 'NAVAL' : 'AEREO';

        /* Estado global de la partida */
        let cols = 0; /* Cantidad de columnas del mapa */
        let rows = 0; /* Cantidad de filas del mapa */
        let discovered = []; /* Matriz que indica que celdas fueron descubiertas */
        let drones = []; /* Lista de drones del bando seleccionado */
        let activeDroneIndex = 0; /* Drone actualmente controlado */
        let isPortaSelected = false; /* Controla si la unidad activa es el porta dron */
        let isDeployMode = false; /* Espera click en mapa para colocar dron */
        let isMoving = false; /* Evita iniciar otra animacion mientras el jugador se desplaza */
        const stepDelayMs = 90; /* Tiempo entre pasos para simular movimiento */

        /* Estado interno para animar el sprite por frames */
        let spriteReady = false;
        let spriteFrameIndex = 0;
        let spriteFrameCount = 1;
        let spriteFrameSize = 0;
        let lastSpriteFrameTime = 0;
        let portaDronNavalReady = false;
        let portaDronAereoReady = false;
        const portaDronNaval = { x: 0, y: 0, size: 2, moveRadius: 2, revealRadius: 2, color: '#4ec5ff', nombre: 'Porta Dron Naval' };
        const portaDronAereo = { x: 0, y: 0, size: 2, moveRadius: 2, revealRadius: 2, color: '#ffd166', nombre: 'Porta Dron Aereo' };

        /* Cuando carga la imagen, calcula tamaño y numero de frames */
        droneSprite.onload = () => {
            /* Asume un sprite horizontal de frames cuadrados */
            spriteFrameSize = droneSprite.height;
            spriteFrameCount = Math.max(1, Math.floor(droneSprite.width / spriteFrameSize));
            spriteReady = true;
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
            return drones[activeDroneIndex] || null;
        }

        /* Crea la flota completa segun el bando elegido */
        function buildFleet() {
            const config = DRONE_SETUP[bandoSeleccionado];
            const fleet = [];
            let id = 1;

            if (!config) {
                return fleet;
            }

            for (let i = 0; i < config.cantidad; i++) {
                fleet.push({
                    id,
                    nombre: config.nombre,
                    moveRadius: config.moveRadius,
                    revealRadius: config.revealRadius,
                    color: config.color,
                    deployed: false,
                    x: null,
                    y: null
                });
                id += 1;
            }

            return fleet;
        }

        /* Revela columnas iniciales segun bando */
        function revealStartColumnsByBando() {
            const columnsToReveal = Math.min(3, cols);
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
            portaDronNaval.y = Math.max(0, Math.min(rows - portaDronNaval.size, Math.floor(rows / 2) - 1));
        }

        function positionPortaDronAereo() {
            portaDronAereo.x = Math.max(0, cols - portaDronAereo.size);
            portaDronAereo.y = Math.max(0, Math.min(rows - portaDronAereo.size, Math.floor(rows / 2) - 1));
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

        /* Actualiza textos del panel y reconstruye la lista de drones clickeables */
        function updateInfoPanel() {
            const drone = getActiveDrone();
            const ownPorta = getOwnPorta();
            bandoLabel.textContent = `Bando: ${bandoSeleccionado}`;
            if (isPortaSelected) {
                droneTypeLabel.textContent = `${ownPorta.nombre} (En mapa)`;
                droneRangeLabel.textContent = `Alcance: ${ownPorta.moveRadius} celdas`;
                droneVisionLabel.textContent = `Vision: ${ownPorta.revealRadius} celdas`;
            } else if (!drone) {
                droneTypeLabel.textContent = 'Dron activo: -';
                droneRangeLabel.textContent = 'Alcance: -';
                droneVisionLabel.textContent = 'Vision: -';
            } else {
                const status = drone.deployed ? 'En mapa' : 'Sin desplegar';
                droneTypeLabel.textContent = `Dron activo: #${drone.id} ${drone.nombre} (${status})`;
                droneRangeLabel.textContent = `Alcance: ${drone.moveRadius} celdas`;
                droneVisionLabel.textContent = `Vision: ${drone.revealRadius} celdas`;
            }

            if (!isDeployMode) {
                setupHint.textContent = 'Inicio sin piezas. Elige un dron y pulsa Desplegar.';
            }

            /* Limpia y vuelve a crear la lista para reflejar seleccion actual */
            fleetList.innerHTML = '';
            const portaItem = document.createElement('button');
            portaItem.type = 'button';
            portaItem.textContent = `${ownPorta.nombre} | 2x2 | Mapa`;
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
                item.textContent = `#${d.id} ${d.nombre} | ${d.deployed ? 'Mapa' : 'Reserva'} | Alc ${d.moveRadius} | Vis ${d.revealRadius}`;
                item.style.width = '100%';
                item.style.textAlign = 'left';
                item.style.padding = '4px 6px';
                item.style.border = '1px solid #6a4a1c';
                item.style.background = i === activeDroneIndex ? 'rgba(242, 203, 103, 0.25)' : 'rgba(15, 25, 30, 0.55)';
                item.style.color = '#f7e7b2';
                item.style.cursor = 'pointer';

                /* Al hacer click en un dron de la lista, lo activa */
                item.addEventListener('click', () => {
                    activeDroneIndex = i;
                    isPortaSelected = false;
                    isDeployMode = false;
                    revealAroundActiveDrone();
                    updateInfoPanel();
                    drawScene();
                });

                fleetList.appendChild(item);
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
            cols = Math.max(1, Math.floor(canvas.width / grid));
            rows = Math.max(1, Math.floor(canvas.height / grid));
            discovered = Array.from({ length: rows }, () => Array(cols).fill(false));
            revealStartColumnsByBando();
            positionPortaDronNaval();
            positionPortaDronAereo();

            if (!drones.length) {
                drones = buildFleet();
                activeDroneIndex = 0;
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

            /* Dibuja las l?neas verticales de la grilla */
            for (let x = 0; x <= canvas.width; x += grid) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            /* Dibuja las l?neas horizontales de la grilla */
            for (let y = 0; y <= canvas.height; y += grid) {
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
                    ctx.fillRect(x * grid, y * grid, grid, grid);
                }
            }

            /* Centro y radio del l?mite de movimiento del dron activo */
            if (hasUnit) {
                const px = centerX * grid;
                const py = centerY * grid;
                const outlineRadiusPx = moveRadius * grid;
                ctx.save();
                ctx.strokeStyle = 'rgba(242, 203, 103, 0.7)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(px, py, outlineRadiusPx, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        }

        /* Dibuja todos los drones en el tablero.
           Usa sprite animado si est? cargado, o un c?rculo de respaldo si no */
        function drawSinglePortaDron(porta, sprite, spriteReady, isSelected) {
            const px = porta.x * grid;
            const py = porta.y * grid;
            const sizePx = porta.size * grid;

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

        function drawDrones() {
            for (let i = 0; i < drones.length; i++) {
                const drone = drones[i];
                if (!drone.deployed) {
                    continue;
                }
                const px = (drone.x + 0.5) * grid;
                const py = (drone.y + 0.5) * grid;
                const size = Math.floor(grid * 1.05);
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
                    ctx.arc(px, py, Math.max(10, Math.floor(grid * 0.35)), 0, Math.PI * 2);
                    ctx.fill();
                }

                /* Borde blanco para el dron activo y color de bando para el resto */
                ctx.save();
                ctx.lineWidth = i === activeDroneIndex ? 3 : 2;
                ctx.strokeStyle = i === activeDroneIndex ? '#ffffff' : drone.color;
                ctx.beginPath();
                ctx.arc(px, py, Math.max(12, Math.floor(grid * 0.42)), 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        }

        /* Renderiza toda la escena en el orden correcto:
           primero el mapa, luego la niebla de guerra y finalmente los drones */
        function drawScene() {
            drawMap();
            drawPortaDrones();
            drawDrones();
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
        canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor((event.clientX - rect.left) / grid);
            const y = Math.floor((event.clientY - rect.top) / grid);

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

                drone.deployed = true;
                drone.x = x;
                drone.y = y;
                isDeployMode = false;
                revealAroundActiveDrone();
                updateInfoPanel();
                drawScene();
                return;
            }

            const clickedDroneIndex = drones.findIndex((drone) => drone.deployed && drone.x === x && drone.y === y);
            if (clickedDroneIndex >= 0) {
                activeDroneIndex = clickedDroneIndex;
                isPortaSelected = false;
                revealAroundActiveDrone();
                updateInfoPanel();
                drawScene();
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

            moveActiveDroneTo(x, y);
        });

        /* Boton del panel para avanzar al siguiente dron de la flota */
        nextDroneBtn.addEventListener('click', () => {
            if (!drones.length) {
                return;
            }

            let nextIndex = activeDroneIndex;
            let found = false;
            for (let i = 0; i < drones.length; i++) {
                nextIndex = (nextIndex + 1) % drones.length;
                if (drones[nextIndex].deployed) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                setupHint.textContent = 'No hay drones desplegados para cambiar';
                return;
            }

            activeDroneIndex = nextIndex;
            isPortaSelected = false;
            isDeployMode = false;
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
            setupHint.textContent = `Despliegue activo: haz click en el mapa para colocar #${drone.id}`;
        });

        /* Evento que se ejecuta cuando cambia el tamaño de la ventana.
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
        if (!drones.length) {
            drones = buildFleet();
            activeDroneIndex = 0;
        }
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




