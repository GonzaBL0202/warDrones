package com.wardrones.warDrones.model.dto.request;

public class MovimientoDronRequest {

    private int dronId;
    private int partidaId;
    private int jugadorId;
    private int portadronId;
    private int x;
    private int y;

    public int getDronId(){
        return dronId;
    }

    public int getJugadorId(){
        return jugadorId;
    }

    public int getPartidaId(){
        return partidaId;
    }

    public int getPortadronId(){
        return portadronId;
    }

    public int getX(){
        return x;
    }

    public int getY(){
        return y;
    }

    public void setDronId(int dronId) {
        this.dronId = dronId;
    }

    public void setJugadorId(int jugadorId) {
        this.jugadorId = jugadorId;
    }

    public void setPartidaId(int partidaId) {
        this.partidaId = partidaId;
    }

    public void setPortadronId(int portadronId) {
        this.portadronId = portadronId;
    }

    public void setX(int x) {
        this.x = x;
    }

    public void setY(int y) {
        this.y = y;
    }
}
