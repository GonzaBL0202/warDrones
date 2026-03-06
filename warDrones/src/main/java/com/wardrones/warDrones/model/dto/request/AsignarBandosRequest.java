package com.wardrones.warDrones.model.dto.request;

public class AsignarBandosRequest {

    private int partidaId;
    private String bando1; // Bando del usuario 1
    private String bando2; // Bando del usuario 2

    public AsignarBandosRequest() {
    }

    public AsignarBandosRequest(int partidaId, String bando1, String bando2) {
        this.partidaId = partidaId;
        this.bando1 = bando1;
        this.bando2 = bando2;
    }

    public int getPartidaId() {
        return partidaId;
    }

    public void setPartidaId(int partidaId) {
        this.partidaId = partidaId;
    }

    public String getBando1() {
        return bando1;
    }

    public void setBando1(String bando1) {
        this.bando1 = bando1;
    }

    public String getBando2() {
        return bando2;
    }

    public void setBando2(String bando2) {
        this.bando2 = bando2;
    }
}
