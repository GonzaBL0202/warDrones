package com.wardrones.warDrones.model.dto.response;

public class RankingVictoriasResponse {

    private int jugadorId;
    private String nombre;
    private int victorias;

    public RankingVictoriasResponse() {
    }

    public RankingVictoriasResponse(int jugadorId, String nombre, int victorias) {
        this.jugadorId = jugadorId;
        this.nombre = nombre;
        this.victorias = victorias;
    }

    public int getJugadorId() {
        return jugadorId;
    }

    public String getNombre() {
        return nombre;
    }

    public int getVictorias() {
        return victorias;
    }

    public void setJugadorId(int jugadorId) {
        this.jugadorId = jugadorId;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public void setVictorias(int victorias) {
        this.victorias = victorias;
    }
}
