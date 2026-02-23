package com.wardrones.warDrones.model.dto.request;

public class RecargarDronRequest {

    private int jugadorId;

    private int partidaId;

    private int dronId;

    public int getJugadorId() {
        return jugadorId;
    }

    public int getPartidaId() {
        return partidaId;
    }

    public int getDronId() {
        return dronId;
    }

    public void setJugadorId(int jugadorId) {
        this.jugadorId = jugadorId;
    }

    public void setPartidaId(int partidaId) {
        this.partidaId = partidaId;
    }
}
