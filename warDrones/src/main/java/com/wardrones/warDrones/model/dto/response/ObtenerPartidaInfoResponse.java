package com.wardrones.warDrones.model.dto.response;

import java.util.ArrayList;
import java.util.List;

public class ObtenerPartidaInfoResponse {

    private int partidaId;
    private int usuarioId1;
    private int usuarioId2;
    private String bando1;
    private String bando2;
    private boolean bandosAsignados;
    private int bandosDesplegados;
    private Integer turnoActual;
    private List<DronInfo> drones = new ArrayList<>();
    private List<PortadronInfo> portadrones = new ArrayList<>();

    public ObtenerPartidaInfoResponse() {
    }

    public ObtenerPartidaInfoResponse(int partidaId, int usuarioId1, int usuarioId2,
                                      String bando1, String bando2, boolean bandosAsignados,
                                      int bandosDesplegados, Integer turnoActual,
                                      List<DronInfo> drones, List<PortadronInfo> portadrones) {
        this.partidaId = partidaId;
        this.usuarioId1 = usuarioId1;
        this.usuarioId2 = usuarioId2;
        this.bando1 = bando1;
        this.bando2 = bando2;
        this.bandosAsignados = bandosAsignados;
        this.bandosDesplegados = bandosDesplegados;
        this.turnoActual = turnoActual;
        this.drones = drones;
        this.portadrones = portadrones;
    }

    public int getPartidaId() {
        return partidaId;
    }

    public void setPartidaId(int partidaId) {
        this.partidaId = partidaId;
    }

    public int getUsuarioId1() {
        return usuarioId1;
    }

    public void setUsuarioId1(int usuarioId1) {
        this.usuarioId1 = usuarioId1;
    }

    public int getUsuarioId2() {
        return usuarioId2;
    }

    public void setUsuarioId2(int usuarioId2) {
        this.usuarioId2 = usuarioId2;
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

    public boolean isBandosAsignados() {
        return bandosAsignados;
    }

    public void setBandosAsignados(boolean bandosAsignados) {
        this.bandosAsignados = bandosAsignados;
    }

    public int getBandosDesplegados() {
        return bandosDesplegados;
    }

    public void setBandosDesplegados(int bandosDesplegados) {
        this.bandosDesplegados = bandosDesplegados;
    }

    public Integer getTurnoActual() {
        return turnoActual;
    }

    public void setTurnoActual(Integer turnoActual) {
        this.turnoActual = turnoActual;
    }

    public List<DronInfo> getDrones() {
        return drones;
    }

    public void setDrones(List<DronInfo> drones) {
        this.drones = drones;
    }

    public List<PortadronInfo> getPortadrones() {
        return portadrones;
    }

    public void setPortadrones(List<PortadronInfo> portadrones) {
        this.portadrones = portadrones;
    }

    public static class DronInfo {
        private int id;
        private int portadronId;
        private String bando;
        private int posicionX;
        private int posicionY;
        private int vida;
        private int municion;
        private int recargas;
        private boolean estado;
        

        public DronInfo() {}

        public DronInfo(int id, int portadronId, String bando, int posicionX, int posicionY, int vida, int municion,
                        int recargas, boolean estado) {
            this.id = id;
            this.portadronId = portadronId;
            this.bando = bando;
            this.posicionX = posicionX;
            this.posicionY = posicionY;
            this.vida = vida;
            this.municion = municion;
            this.recargas = recargas;
            this.estado = estado;
        }

        public int getId() {
            return id;
        }

        public int getPortadronId() {
            return portadronId;
        }

        public String getBando() {
            return bando;
        }

        public int getPosicionX() {
            return posicionX;
        }

        public int getPosicionY() {
            return posicionY;
        }

        public int getVida() {
            return vida;
        }

        public int getMunicion() {
            return municion;
        }

        public int getRecargas() {
            return recargas;
        }

        public boolean isEstado() {
            return estado;
        }
    }

    public static class PortadronInfo {
        private int id;
        private String tipo;
        private int posicionX;
        private int posicionY;
        private int vida;
        private boolean estado;

        public PortadronInfo() {}

        public PortadronInfo(int id, String tipo, int posicionX, int posicionY, int vida, boolean estado) {
            this.id = id;
            this.tipo = tipo;
            this.posicionX = posicionX;
            this.posicionY = posicionY;
            this.vida = vida;
            this.estado = estado;
        }

        public int getId() {
            return id;
        }

        public String getTipo() {
            return tipo;
        }

        public int getPosicionX() {
            return posicionX;
        }

        public int getPosicionY() {
            return posicionY;
        }

        public int getVida() {
            return vida;
        }

        public boolean isEstado() {
            return estado;
        }
    }
}
