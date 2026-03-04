package com.wardrones.warDrones.model.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAlias;

public class NieblaDescubiertaRequest {
    // the JSON coming from the client uses property "discovered" (legacy), but
    // other callers may send "nieblaDescubierta"; allow both via alias.
    @JsonProperty("discovered")
    @JsonAlias({"nieblaDescubierta"})
    private String discovered;

    public NieblaDescubiertaRequest() {
    }

    public NieblaDescubiertaRequest(String discovered) {
        this.discovered = discovered;
    }

    @JsonProperty("discovered")
    public String getNieblaDescubierta() {
        return discovered;
    }

    @JsonProperty("discovered")
    public void setNieblaDescubierta(String discovered) {
        this.discovered = discovered;
    }
}
