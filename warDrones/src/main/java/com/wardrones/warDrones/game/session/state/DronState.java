package com.wardrones.warDrones.game.session.state;

import com.wardrones.warDrones.model.entity.Dron;

public class DronState {

    private int id;            //no cambia, a revisar
    private int portadronId;  //no cambia, a revisar
    private int vida;
    private boolean estado;
    private int recargas;
    private int municion;
    private int x;
    private int y;

    //falta aclarar si el ataque y el rango de movimiento se define como atributos propios o se calcula mediante funciones ya sea en esta clase o en otra relacionada (portadronstate)

    //aca iria constructora/funcion para crear el objeto con los datos obtenidos desde la base de datos mediante la clase Dron o definirla en otra clase (ya sea esta, service o gamesession)
    public DronState() {}

    public DronState(Dron dron){
        this.id = dron.getId();
        this.portadronId = dron.getPortadronId().getId();
        this.vida = dron.getVida();
        this.estado = dron.getEstado();
        this.recargas = dron.getRecargas();
        this.municion = dron.getMunicion();
        this.x = dron.getPosicionX();
        this.y = dron.getPosicionY();
    }

    //selectoras
    public int getId() {
        return id;
    }

    public int getPortadronId() {
        return portadronId;
    }

    public int getVida() {
        return vida;
    }

    public boolean getEstado() {
        return estado;
    }

    public int getRecargas() {
        return recargas;
    }

    public int getMunicion() {
        return municion;
    }

   public int getPosicionX() {
        return x;
    }

    public int getPosicionY() {
        return y;
    }

    public void setX(int x) {
        this.x = x;
    }

    public void setY(int y) {
        this.y = y;
    }


}
