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
    private int anchoMapa = 35;
    private int largoMapa = 20;


    public GameSession(Partida par){
        partidaId = par.getPartidaId();
        jugador1Id = par.getUsuarioId1().getId();
        jugador2Id = par.getUsuarioId2().getId();
        jugadorEnTurno = par.getTurno();
        activa = par.getActiva();
    }

     public void validarTurno(int usuarioId) {
        if (usuarioId != jugadorEnTurno) {
            throw new IllegalStateException("No es tu turno");
        }
    }
    
    public void cambiarTurno() {
        if (jugadorEnTurno == jugador1Id) {
            jugadorEnTurno = jugador2Id;
        } else {
            jugadorEnTurno = jugador1Id;
        }
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
}

