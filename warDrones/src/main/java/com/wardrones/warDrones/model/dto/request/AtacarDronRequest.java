package com.wardrones.warDrones.model.dto.request;

public class AtacarDronRequest {

    private int portadronId;
    private int dronAtacanteId;
    private int dronObjetivoId;

    public int getPortadronId() {
        return portadronId;
    }

    public int getDronAtacanteId() {
        return dronAtacanteId;
    }

    public int getDronObjetivoId() {
        return dronObjetivoId;
    }

    public void setPortadronId(int portadronId) {
        this.portadronId = portadronId;
    }

    public void setDronAtacanteId(int dronAtacanteId) {
        this.dronAtacanteId = dronAtacanteId;
    }

    public void setDronObjetivoId(int dronObjetivoId) {
        this.dronObjetivoId = dronObjetivoId;
    }
}
