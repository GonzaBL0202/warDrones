package com.wardrones.warDrones.model.dto.request;

public class NieblaDescubiertaRequest {
    private String discovered;

    public NieblaDescubiertaRequest() {
    }

    public NieblaDescubiertaRequest(String discovered) {
        this.discovered = discovered;
    }

    public String getNieblaDescubierta() {
        return discovered;
    }

    public void setNieblaDescubierta(String discovered) {
        this.discovered = discovered;
    }
}
