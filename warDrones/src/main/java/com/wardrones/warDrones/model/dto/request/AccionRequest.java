package com.wardrones.warDrones.model.dto.request;

public class AccionRequest {
    private int partidaId;
    private int usuarioId;
    
    public AccionRequest() {
    }

    public int getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(int usuarioId) {
        this.usuarioId = usuarioId;
    }

    public int getPartidaId() {
        return partidaId;
    }

    public void setPartidaId(int pId) {
        this.partidaId = pId;
    }
}


    