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
import com.wardrones.warDrones.model.enums.Estado;  

//GameSession: Es utilizado para manejar en mememoria el estado de la partida (turnos,estado,drones,etc...)

public class GameSession {

    private int partidaId;
    private int jugador1Id;
    private int jugador2Id;
    private Bando jugador1Bando;
    private Bando jugador2Bando;
    private int jugadorEnTurno;
    private Estado estado;

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
        estado = par.getPartidaEstado();
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


    public void moverPortadron(int nuevaX, int nuevaY, int usuarioId) {

        validarTurno(usuarioId);

        if (usuarioId == jugador1Id){
            switch (jugador1Bando) {
                case NAVAL -> {
                    PortadronNaval.setPosicionX(nuevaX);
                    PortadronNaval.setPosicionY(nuevaY);
                }
                case AEREO -> {
                    PortadronAereo.setPosicionX(nuevaX);
                    PortadronAereo.setPosicionY(nuevaY);
                }
                default -> throw new IllegalArgumentException("Bando del jugador 1 no reconocido");
            }
        }
        else if (usuarioId == jugador2Id){
            switch (jugador2Bando) {
                case NAVAL -> {
                    PortadronNaval.setPosicionX(nuevaX);
                    PortadronNaval.setPosicionY(nuevaY);
                }
                case AEREO -> {
                    PortadronAereo.setPosicionX(nuevaX);
                    PortadronAereo.setPosicionY(nuevaY);
                }
                default -> throw new IllegalArgumentException("Bando del jugador 2 no reconocido");
            }
        }
        else {
            throw new IllegalArgumentException("Usuario no encontrado en la partida");
        }
    }


    public void atacarDron(int dronAtaId, int dronObjId, int usuarioId) {

        validarTurno(usuarioId);

        DronState dronA = drones.get(dronAtaId);
        DronState dronB = drones.get(dronObjId);

        if (dronA ==null) 
            throw new IllegalArgumentException("Dron atacante inexistente");
        else if (dronB==null)
            throw new IllegalArgumentException("Dron objetivo inexistente");

        if(!PortadronNaval.getListadoDronesIds().contains(dronAtaId) && !PortadronAereo.getListadoDronesIds().contains(dronAtaId))
            throw new IllegalArgumentException("El dron atacante no pertenece a ningún portadron");
        else if (!PortadronNaval.getListadoDronesIds().contains(dronObjId) && !PortadronAereo.getListadoDronesIds().contains(dronObjId))
            throw new IllegalArgumentException("El dron objetivo no pertenece a ningún portadron");


        //reduce la municion del dron atacante
        if(dronA.getMunicion()==0)
            throw new IllegalArgumentException("Dron atacante sin municion");
        else
            dronA.bajarMunicion();

        //reduce la vida y mata al dron objetivo
        if(dronB.getVida()==0 || !dronB.getEstado())
            throw new IllegalArgumentException("Dron objetivo estaba muerto");
        else {
            dronB.setVida(0);
            dronB.setEstado(false);
        }

    }

    public void atacarPortadron(int dronAtaId, int usuarioId) {

        validarTurno(usuarioId);
        
        int objPorta = 0; //0 si es null, 1 si es naval, 2 si es aereo

        DronState dronA = drones.get(dronAtaId);

        if (dronA ==null) 
            throw new IllegalArgumentException("Dron atacante inexistente");

        if(!PortadronNaval.getListadoDronesIds().contains(dronAtaId) && !PortadronAereo.getListadoDronesIds().contains(dronAtaId))
            throw new IllegalArgumentException("El dron atacante no pertenece a ningún portadron");


        //validar el bando del portadron objetivo
        if (usuarioId == jugador1Id){
            switch (jugador1Bando) {
                case NAVAL : {
                    objPorta = 2;
                } break;
                case AEREO : {
                    objPorta = 1;
                } break;
                default : throw new IllegalArgumentException("Bando del jugador 1 no reconocido");
            }
        }
        else if (usuarioId == jugador2Id){
            switch (jugador2Bando) {
                case NAVAL : {
                    objPorta = 2;
                } break;
                case AEREO : {
                    objPorta = 1;
                } break;
                default : throw new IllegalArgumentException("Bando del jugador 2 no reconocido");
            }
        }
        else {
            throw new IllegalArgumentException("Usuario no encontrado en la partida");
        }

        //reduce la municion del dron atacante
        if(dronA.getMunicion()==0)
            throw new IllegalArgumentException("Dron atacante sin municion");
        else
            dronA.bajarMunicion();

        //reduce la vida y mata al dron objetivo
        if (objPorta == 1) { //es naval
            if(PortadronNaval.getVida()==0 || !PortadronNaval.getEstado())
                throw new IllegalArgumentException("Portadron objetivo estaba muerto");
            else {
                PortadronNaval.reducirVida();
            if (PortadronNaval.getVida()==0)
                PortadronNaval.setEstado(false);
            }

        } else if (objPorta == 2) {//es aereo
            if(PortadronAereo.getVida()==0 || !PortadronAereo.getEstado())
                throw new IllegalArgumentException("Portadron objetivo estaba muerto");
            else {
                PortadronAereo.reducirVida();
            if (PortadronAereo.getVida()==0)
                PortadronAereo.setEstado(false);
            }

        } else
            throw new IllegalArgumentException("Portadron objetivo inexistente");

    }


    public void recargarDron(int dronId, int usuarioId) {

        validarTurno(usuarioId);

        boolean dronNaval;

        DronState dron = drones.get(dronId);

        if (dron == null) {
            throw new IllegalArgumentException("Dron inexistente");
        }

        if (PortadronNaval.getListadoDronesIds().contains(dronId)) 
            dronNaval = true;
        else if(PortadronAereo.getListadoDronesIds().contains(dronId)) 
            dronNaval = false;
        else
            throw new IllegalArgumentException("El dron no pertenece a ningún portadron");
        

        //recargar la municion del dron
        if (dron.getRecargas()==0)
                throw new IllegalArgumentException("No tiene recargas disponibles");
        else {
            if (dronNaval) { //si es naval, recarga 2 misiles extras
                dron.setRecargas(0);
                dron.aumentarMunicion();
                dron.aumentarMunicion();
            }
            else { //si es aereo, recarga 1 bomba extra
                dron.setRecargas(0);
                dron.aumentarMunicion();
            }
        }

    }


    //selectoras

    public int getTurnoActual() {
        return jugadorEnTurno;
    }

    public int getPartidaId(){
        return partidaId;
    }

    public int getJugadorEnTurno(){
        return jugadorEnTurno;
    }

    public int getBandosDesplegados(){
        return bandosDesplegados;
    }
    
    public Estado getEstado() {
        return estado;
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

