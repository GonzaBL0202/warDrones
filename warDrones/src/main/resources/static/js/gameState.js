class GameState {
    constructor() {
        this.drones = [];
        this.activeDroneId = null;
    }

    setDrones(drones) {
        this.drones = Array.isArray(drones) ? drones : [];
        this.activeDroneId = this.drones[0]?.id ?? null;
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
    
    selectNextDeployedDrone() {
        if (!this.drones.length || this.activeDroneId === null) {
            return false;
        }

        const deployed = this.drones.filter((d) => d.deployed);
        if (!deployed.length) {
            return false;
        }

        const currentIndex = this.drones.findIndex((d) => d.id === this.activeDroneId);
        let nextIndex = currentIndex;
        for (let i = 0; i < this.drones.length; i++) {
            nextIndex = (nextIndex + 1) % this.drones.length;
            if (this.drones[nextIndex].deployed) {
                this.activeDroneId = this.drones[nextIndex].id;
                return true;
            }
        }
        return false;
    }
}

window.GameState = GameState;
