package com.wardrones.warDrones.model.dto.request;

public class RecargarDronRequest {

    private int portadronId;

    private int dronId;

    public int getPortadronId() {
        return portadronId;
    }   

    public int getDronId() {
        return dronId;
    }

    public void setPortadronId(int portadronId) {
        this.portadronId = portadronId;
    }

    public void setDronId(int dronId) {
        this.dronId = dronId;
    }
}
