package com.wardrones.warDrones.model.entity;

import com.wardrones.warDrones.model.enums.Bando;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Portadron {

    protected Portadron(){} //JPA requiere un constructor sin argumentos para crear instancias de la entidad.   

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int portadronId;

    @ManyToOne
    @JoinColumn(name = "portadronpartida_id", nullable = false)
    private Partida portadronPartidaId;

    @Enumerated(EnumType.STRING)
    private Bando portadronTipo;

    private int portadronPosicionX;
    private int portadronPosicionY;
    private boolean portadronEstado;
    private int portadronVida;

    // fog-of-war matrix serialized as JSON, stored separately for each portadron/player
    @jakarta.persistence.Column(columnDefinition = "TEXT")
    private String discovered;

    public Portadron(Partida partida, Bando tipo){
        this.portadronPartidaId = partida;
        this.portadronTipo = tipo;
        this.portadronPosicionX = 0;
        this.portadronPosicionY = 0;
        this.portadronEstado = true;
        if(tipo == Bando.NAVAL){
            this.portadronVida = 3;
        } else {
            this.portadronVida = 6;
        }
    }


    // Getters
    public int getId() {
        return portadronId;
    }

    public Partida getPartidaId() {
        return portadronPartidaId;
    }

    public Bando getTipo() {
        return portadronTipo;
    }

    public int getPosicionX() {
        return portadronPosicionX;
    }

    public int getPosicionY() {
        return portadronPosicionY;
    }

    public boolean getEstado() {
        return portadronEstado;
    }

    public int getVida(){
        return portadronVida;
    }

    //Setters
    public void setPosicionX(int x) {
        this.portadronPosicionX = x;
    }

    public void setPosicionY(int y) {
        this.portadronPosicionY = y;
    }

    public void setEstado(boolean estado) {
        this.portadronEstado = estado;
    }

    public void setVida(int vida) {
        this.portadronVida = vida;
    }

    // fog accessors
    public String getDiscovered() {
        return discovered;
    }

    public void setDiscovered(String discovered) {
        this.discovered = discovered;
    }
}
