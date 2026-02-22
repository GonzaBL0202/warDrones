package com.wardrones.warDrones.game.session;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.wardrones.warDrones.game.session.state.DronState;
import com.wardrones.warDrones.game.session.state.PortadronState;
import com.wardrones.warDrones.model.entity.Dron;
import com.wardrones.warDrones.model.entity.Partida;
import com.wardrones.warDrones.model.entity.Portadron;
import com.wardrones.warDrones.model.enums.Bando;

//GameSession: Es utilizado para manejar en mememoria el estado de la partida (turnos,estado,drones,etc...)

public class GameSession {

    private int partidaId;
    private int jugador1Id;
    private int jugador2Id;
    private Bando jugador1Bando;
    private Bando jugador2Bando;
    private int jugadorEnTurno;
    private boolean activa;

    //asignacion de portadrones
    private PortadronState PortadronNaval;
    private PortadronState PortadronAereo;

    //Mapeo de drones en la partida
    private final Map<Integer, DronState> drones = new HashMap<>();

    //tamanio del mapa
    private final int anchoMapa = 35;
    private final int largoMapa = 20;

    private int bandosDesplegados = 0; 

    public GameSession(Partida par){
        partidaId = par.getPartidaId();
        jugador1Id = par.getUsuarioId1().getId();
        jugador2Id = par.getUsuarioId2().getId();
        activa = par.getActiva();
    }

    //funciones
    public void validarTurno(int usuarioId) {
        if (usuarioId != jugadorEnTurno && jugadorEnTurno > 0) {
            throw new IllegalStateException("No es tu turno");
        }
    }
    
    public void cambiarTurno() {
        if(jugadorEnTurno > 0){
            if (jugadorEnTurno == jugador1Id) {
                jugadorEnTurno = jugador2Id;
            } else {
                jugadorEnTurno = jugador1Id;
            }
        }
    }

    public void moverDron(int dronId, int nuevaX, int nuevaY, int usuarioId) {

        validarTurno(usuarioId);

        DronState dron = drones.get(dronId);

        if (dron == null) {
            throw new IllegalArgumentException("Dron inexistente");
        }

        if (!PortadronNaval.getListadoDronesIds().contains(dronId) && !PortadronAereo.getListadoDronesIds().contains(dronId)) {
            throw new IllegalArgumentException("El dron no pertenece a ningún portadron");
        }
       
        dron.setX(nuevaX);
        dron.setY(nuevaY);
    }

    public void moverPortaDron(int nuevaX, int nuevaY, int usuarioId) {

        validarTurno(usuarioId);

        PortadronState portadron = null;

        if (usuarioId == jugador1Id) {
            portadron = PortadronNaval;
        } else if (usuarioId == jugador2Id) {
            portadron = PortadronAereo;
        }

        if (portadron == null) {
            throw new IllegalArgumentException("PortaDron inexistente");
        }

        portadron.setPosicionX(nuevaX);
        portadron.setPosicionY(nuevaY);
    }

    public int getTurnoActual() {
        return jugadorEnTurno;
    }

    public int getPartidaId(){
        return partidaId;
    }

    public boolean getActiva(){
        return activa;
    }

    public int getJugadorEnTurno(){
        return jugadorEnTurno;
    }

    public int getBandosDesplegados(){
        return bandosDesplegados;
    }       

    public void setJugadorEnTurno(int jugadorEnTurno) {
        this.jugadorEnTurno = jugadorEnTurno;
    }
   
    public void setBandosDesplegados(int bandosDesplegados) {
        this.bandosDesplegados = bandosDesplegados;
    }

    public void setBandos(Bando b1, Bando b2){
        this.jugador1Bando = b1;
        this.jugador2Bando = b2;
    }

    //Se carga portadronstate a travez de portadron, Siempre va primero el aereo y luego el naval
    public void setPortadrones(Portadron p1, Portadron p2){
        PortadronState ps1 = new PortadronState(p1);
        PortadronState ps2 = new PortadronState(p2);

        this.PortadronAereo = ps1;
        this.PortadronNaval = ps2;
    }

    //Se carga la lista de dronesstate y listado de id's en portadrones a travez de una lista de drones
    public void setDrones(List<Dron> listaDrones) {
        for (Dron dron : listaDrones) {
            DronState ds = new DronState(dron);
            drones.put(dron.getId(), ds);
            
            if(dron.getPortadronId().getTipo() == Bando.AEREO){
                PortadronAereo.getListadoDronesIds().add(dron.getId());
            } else {
                PortadronNaval.getListadoDronesIds().add(dron.getId());
            }       
        }
    }
}

