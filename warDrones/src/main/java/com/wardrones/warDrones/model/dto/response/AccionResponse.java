package com.wardrones.warDrones.model.dto.response;

public class AccionResponse {

    private boolean exito;
    private String mensaje; // solo si exito = false y si es necesario manejar excepciones desde el backend (quizas se realizan desde el front ej: el login)
    private int jugadorEnTurno; //si exito = true entonces cambia al otro jugador
    private boolean partidaFinalizada;
    private int ganadorId; // null si no terminó

    public boolean getExito() {
        return exito;
    }

    public String getMensaje() {
        return mensaje;
    }

    public int getJugadorEnTurno() {
        return jugadorEnTurno;
    }

    public boolean getPartidaFinalizada() {
        return partidaFinalizada;
    }

    public int getGanadorId() {
        return ganadorId;
    }

    public void setExito(boolean exito) {
        this.exito = exito;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public void setJugadorEnTurno(int jugadorEnTurno) {
        this.jugadorEnTurno = jugadorEnTurno;
    }

    public void setPartidaFinalizada(boolean partidaFinalizada) {
        this.partidaFinalizada = partidaFinalizada;
    }

    public void setGanadorId(int ganadorId) {
        this.ganadorId = ganadorId;
    }
}
