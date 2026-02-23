package com.wardrones.warDrones.model.dto.request;

public class AtacarDronOPortaRequest {

    private int jugadorId;
    private int partidaId;
    private int dronAtacanteId;
    private int dronObjetivoId;

    public int getJugadorId() {
        return jugadorId;
    }

    public int getPartidaId() {
        return partidaId;
    }

    public int getDronAtacanteId() {
        return dronAtacanteId;
    }

    public int getDronObjetivoId() {
        return dronObjetivoId;
    }

    public void setJugadorId(int jugadorId) {
        this.jugadorId = jugadorId;
    }

    public void setPartidaId(int partidaId) {
        this.partidaId = partidaId;
    }

    public void setDronAtacanteId(int dronAtacanteId) {
        this.dronAtacanteId = dronAtacanteId;
    }

    public void setDronObjetivoId(int dronObjetivoId) {
        this.dronObjetivoId = dronObjetivoId;
    }
}
