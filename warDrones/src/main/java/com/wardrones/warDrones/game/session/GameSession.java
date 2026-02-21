package com.wardrones.warDrones.game.session;

import java.util.HashMap;
import java.util.Map;

import com.wardrones.warDrones.game.session.state.DronState;
import com.wardrones.warDrones.game.session.state.PortadronState;
import com.wardrones.warDrones.model.entity.Partida;

//GameSession: Es utilizado para manejar en mememoria el estado de la partida (turnos,estado,drones,etc...)

public class GameSession {

    private int partidaId;
    private int jugador1Id;
    private int jugador2Id;
    private int jugadorEnTurno;
    private boolean activa;

    //asignacion de portadrones
    private PortadronState PortadronNaval;
    private PortadronState portadronAereo;

    //Mapeo de drones en la partida
    private final Map<Integer, DronState> drones = new HashMap<>();

    //tamanio del mapa
    private final int anchoMapa = 35;
    private final int largoMapa = 20;


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

        //A travez del usuario encontrar el portadron y validar que el dron pertenezca a ese portadron
        if (usuarioId == jugador1Id) {
            if (!PortadronNaval.getListadoDronesIds().contains(dronId)) {
                throw new IllegalArgumentException("El dron no pertenece al jugador");
            }
        } else if (usuarioId == jugador2Id) {
            if (!portadronAereo.getListadoDronesIds().contains(dronId)) {
                throw new IllegalArgumentException("El dron no pertenece al jugador");
            }
        }   else {
            throw new IllegalArgumentException("Usuario no reconocido");
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
            portadron = portadronAereo;
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

    public void setJugadorEnTurno(int jugadorEnTurno) {
        this.jugadorEnTurno = jugadorEnTurno;
    }
   
}

