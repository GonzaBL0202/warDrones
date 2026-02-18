package com.wardrones.warDrones.game.session;

import com.wardrones.warDrones.model.entity.Partida;

//GameSession: Es utilizado para manejar en mememoria el estado de la partida (turnos,estado,drones,etc...)

public class GameSession {

    private int partidaId;
    private int jugador1Id;
    private int jugador2Id;
    private int jugadorEnTurno;
    private boolean activa;

    // private Map<int, DronState> drones;
    //Mapeo de drones de la partida **A agregarse en incremento 3**


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

