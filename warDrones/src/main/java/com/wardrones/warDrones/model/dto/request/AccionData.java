package com.wardrones.warDrones.model.dto.request;

public class AccionData {
    private int jugadorId;
    private int partidaId;

    public AccionData() {
    }

    public AccionData(int uId, int pId){
        this.jugadorId = uId;
        this.partidaId = pId;   
    }
    
    public int getPartidaId() {
        return partidaId;
    }

    public void setPartidaId(int partidaId) {
        this.partidaId = partidaId;
    }

    public int getJugadorId() {
        return jugadorId;
    }

    public void setJugadorId(int jugadorId) {
        this.jugadorId = jugadorId;
    }
}
