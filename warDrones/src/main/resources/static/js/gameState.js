class GameState {
    constructor() {
        this.drones = [];
        this.dronesRivales = [];
        this.activeDroneId = null;
    }

    setDrones(drones) {
        this.drones = Array.isArray(drones) ? drones : [];
        //Validar que el dron activo siga existiendo, sino asignar el primero disponible
        if (this.activeDroneId === null || !drones.some(d => d.id === this.activeDroneId && d.vida > 0)) 
            this.activeDroneId = this.drones[0]?.id ?? null;
    }

    setDronesRivales(drones) {
        this.dronesRivales = Array.isArray(drones) ? drones : [];
    }

    getActiveDrone() {
        if (this.activeDroneId === null) {
            return null;
        }
        return this.drones.find((d) => d.id === this.activeDroneId) || null;
    }

    setActiveDroneById(droneId) {
        const exists = this.drones.some((d) => d.id === droneId);
        if (exists) {
            this.activeDroneId = droneId;
        }
    }

    // Busca el siguiente dron desplegado y con vida > 0
    selectNextDeployedDrone() {
        if (!drones.length) return false;
        let idx = drones.findIndex(d => d.id === activeDroneId);
        let count = 0;
        do {
            idx = (idx + 1) % drones.length;
            count++;
            if (drones[idx].deployed && drones[idx].vida > 0) {
                gameState.setActiveDroneById(drones[idx].id);
                return true;
            }
        } while (count < drones.length);
        return false;
    }
}

window.GameState = GameState;
