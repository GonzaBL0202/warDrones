package com.wardrones.warDrones.model.dto.request;

public class PertidaJoinResponse {
    
    private int partidaId;
    private int usuario2Id;

    public PertidaJoinResponse() {
    }

    public int getPartidaId() {
        return partidaId;
    }

    public void setPartidaId(int partidaId) {
        this.partidaId = partidaId;
    }

    public int getUsuario2Id() {
        return usuario2Id;
    }

    public void setUsuario2Id(int usuario2Id) {
        this.usuario2Id = usuario2Id;
    }
    
}
