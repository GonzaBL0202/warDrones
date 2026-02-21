package com.wardrones.warDrones.model.dto.request;

public class RecargarDronRequest {

    private Long portadronId;

    private Long dronId;

    public Long getPortadronId() {
        return portadronId;
    }   

    public Long getDronId() {
        return dronId;
    }

    public void setPortadronId(Long portadronId) {
        this.portadronId = portadronId;
    }

    public void setDronId(Long dronId) {
        this.dronId = dronId;
    }
}
