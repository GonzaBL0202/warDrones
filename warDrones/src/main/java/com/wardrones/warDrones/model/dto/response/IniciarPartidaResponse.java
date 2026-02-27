package com.wardrones.warDrones.model.dto.response;

public class IniciarPartidaResponse {

    private boolean iniciada;
    private int bandosDesplegados;
    private Integer jugadorEnTurno;
    private String mensaje;

    public IniciarPartidaResponse() {
    }

    public IniciarPartidaResponse(boolean iniciada, int bandosDesplegados, Integer jugadorEnTurno, String mensaje) {
        this.iniciada = iniciada;
        this.bandosDesplegados = bandosDesplegados;
        this.jugadorEnTurno = jugadorEnTurno;
        this.mensaje = mensaje;
    }

    public boolean isIniciada() {
        return iniciada;
    }

    public void setIniciada(boolean iniciada) {
        this.iniciada = iniciada;
    }

    public int getBandosDesplegados() {
        return bandosDesplegados;
    }

    public void setBandosDesplegados(int bandosDesplegados) {
        this.bandosDesplegados = bandosDesplegados;
    }

    public Integer getJugadorEnTurno() {
        return jugadorEnTurno;
    }

    public void setJugadorEnTurno(Integer jugadorEnTurno) {
        this.jugadorEnTurno = jugadorEnTurno;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}
