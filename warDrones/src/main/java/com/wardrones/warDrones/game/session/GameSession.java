package com.wardrones.warDrones.game.session;

import java.util.ArrayList;
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
        jugadorEnTurno = par.getUsuarioId1().getId();
        estado = par.getPartidaEstado();
    }

    //funciones
    public void validarTurno(int usuarioId) {
        if (usuarioId != jugadorEnTurno) {
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

    // Desplegar dron en sesion (sin validar turno). Valida que el jugador despliegue sus propios drones.
    public void desplegarDron(int dronId, int x, int y, int jugadorId) {
        DronState dron = drones.get(dronId);
        if (dron == null) {
            throw new IllegalArgumentException("Dron inexistente");
        }

        boolean perteneceAereo = PortadronAereo != null && PortadronAereo.getListadoDronesIds() != null && PortadronAereo.getListadoDronesIds().contains(dronId);
        boolean perteneceNaval = PortadronNaval != null && PortadronNaval.getListadoDronesIds() != null && PortadronNaval.getListadoDronesIds().contains(dronId);

        if (!perteneceAereo && !perteneceNaval) {
            throw new IllegalArgumentException("El dron no pertenece a ningún portadron");
        }

        Bando bandoDron = perteneceAereo ? Bando.AEREO : Bando.NAVAL;
        // validar que jugador corresponde al bando del dron
        if ((jugadorId == jugador1Id && jugador1Bando != bandoDron) || (jugadorId == jugador2Id && jugador2Bando != bandoDron)) {
            throw new IllegalArgumentException("No puedes desplegar drones de otro bando");
        }

        dron.setX(x);
        dron.setY(y);
    }


    //selectoras

    public int getTurnoActual() {
        return jugadorEnTurno;
    }

    public int getPartidaId(){
        return partidaId;
    }

    public int getJugador1Id() {
        return jugador1Id;
    }

    public int getJugador2Id() {
        return jugador2Id;
    }

    public Bando getJugador1Bando() {
        return jugador1Bando;
    }

    public Bando getJugador2Bando() {
        return jugador2Bando;
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

    public PortadronState getPortadronNaval() {
        return PortadronNaval;
    }

    public PortadronState getPortadronAereo() {
        return PortadronAereo;
    }

    public Map<Integer, DronState> getDrones() {
        return drones;
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

        // Si no existen posiciones asignadas en las entidades (0,0), ubicar por defecto:
        int defaultY = Math.max(0, Math.min(largoMapa - 2, (largoMapa / 2) - 1));

        if (this.PortadronNaval != null) {
            if (this.PortadronNaval.getPosicionX() == 0 && this.PortadronNaval.getPosicionY() == 0) {
                this.PortadronNaval.setPosicionX(0);
                this.PortadronNaval.setPosicionY(defaultY);
            }
        }

        if (this.PortadronAereo != null) {
            if (this.PortadronAereo.getPosicionX() == 0 && this.PortadronAereo.getPosicionY() == 0) {
                this.PortadronAereo.setPosicionX(Math.max(0, anchoMapa - 2));
                this.PortadronAereo.setPosicionY(defaultY);
            }
        }
    }

    //Se carga la lista de dronesstate y listado de id's en portadrones a travez de una lista de drones
    public void setDrones(List<Dron> listaDrones) {
        List<Integer> idsAereo = new ArrayList<>();
        List<Integer> idsNaval = new ArrayList<>();

        for (Dron dron : listaDrones) {
            DronState ds = new DronState(dron);
            drones.put(dron.getId(), ds);
            
            if(dron.getPortadronId().getTipo() == Bando.AEREO){
                //No puedo usar get ya que viene en null, uso lista auxiliar de ids en portadronstate para agregar los ids de los drones a cada portadron
                idsAereo.add(dron.getId());
            } else {
                idsNaval.add(dron.getId());
            }       
        }
        PortadronAereo.setListadoDronesIds(idsAereo);
        PortadronNaval.setListadoDronesIds(idsNaval);

        // Debugging: print assigned ids for each portadron
        try {
            System.out.println("[GameSession] Portadron Aereo IDs: " + idsAereo);
            System.out.println("[GameSession] Portadron Naval IDs: " + idsNaval);
            System.out.println("[GameSession] Total drones in map: " + drones.size());
        } catch (Exception e) {
            // no-op
        }
    }
}

