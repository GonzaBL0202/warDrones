package com.wardrones.warDrones.model.dto.request;

public class DesplegarDronRequest {
    private int partidaId;
    private int jugadorId;
    private int dronId;
    private int x;
    private int y;

    public DesplegarDronRequest() {}

    public int getPartidaId() { return partidaId; }
    public void setPartidaId(int partidaId) { this.partidaId = partidaId; }

    public int getJugadorId() { return jugadorId; }
    public void setJugadorId(int jugadorId) { this.jugadorId = jugadorId; }

    public int getDronId() { return dronId; }
    public void setDronId(int dronId) { this.dronId = dronId; }

    public int getX() { return x; }
    public void setX(int x) { this.x = x; }

    public int getY() { return y; }
    public void setY(int y) { this.y = y; }
}
