package com.wardrones.warDrones.model.dto.request;

public class MovimientoPortadronRequest {

    private int jugadorId;
    private int partidaId;
    private int x;
    private int y;

    public int getJugadorId(){
        return jugadorId;
    }

    public int getPartidaId(){
        return partidaId;
    }

    public int getX(){
        return x;
    }

    public int getY(){
        return y;
    }

    public void setJugadorId(int jugadorId) {
        this.jugadorId = jugadorId;
    }

    public void setPartidaId(int partidaId) {
        this.partidaId = partidaId;
    }

    public void setX(int x) {
        this.x = x;
    }

    public void setY(int y) {
        this.y = y;
    }
}
