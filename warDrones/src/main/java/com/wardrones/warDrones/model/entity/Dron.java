package com.wardrones.warDrones.model.entity;

import org.hibernate.annotations.CompositeType;

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
public class Dron {

    protected Dron(){} //JPA requiere un constructor sin argumentos para crear instancias de la entidad.
    
    //La llave debe ser compuesta por dronid y dronportadronid, ejemplo: dronid 1 del portadronid 1, dronid 1 del portadronid 2, etc. Esto es para poder tener drones con el mismo id pero pertenecientes a portadrones diferentes, ya que cada portadron tiene su propia lista de drones. A revisar si esto es necesario o si se puede manejar con un id unico para cada dron y una relacion con el portadron al que pertenece.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int dronId;

    @ManyToOne
    @JoinColumn(name = "dronportadron_id", nullable = false)
    private Portadron dronPortaDronId;

    @Enumerated(EnumType.STRING)
    private Bando dronTipo;

    private int dronPosicionX;
    private int dronPosicionY;
    private boolean dronEstado;
    private int dronVida;
    private int dronMunicion;
    private int dronRecargas;


    public Dron(Portadron portadron, Bando tipo){
        this.dronPortaDronId = portadron;
        this.dronTipo = tipo;
        this.dronPosicionX = 0;
        this.dronPosicionY = 0;
        this.dronEstado = true;
        this.dronRecargas = 1;
        this.dronVida = 1;
        if (tipo == Bando.NAVAL){
            this.dronMunicion = 2;
        } else {
            this.dronMunicion = 1;
        }
    }

    // Getters
    public int getId() {
        return dronId;
    }

    public Portadron getPortadronId() {
        return dronPortaDronId;
    }

    public Bando getTipo() {
        return dronTipo;
    }

    public int getPosicionX() {
        return dronPosicionX;
    }

    public int getPosicionY() {
        return dronPosicionY;
    }

    public boolean getEstado() {
        return dronEstado;
    }

    public int getVida(){
        return dronVida;
    }

    public int getMunicion(){
        return dronMunicion;
    }

    public int getRecargas(){
        return dronRecargas;
    }

    //Setters
    public void setPosicionX(int x) {
        this.dronPosicionX = x;
    }

    public void setPosicionY(int y) {
        this.dronPosicionY = y;
    }

    public void setEstado(boolean estado) {
        this.dronEstado = estado;
    }

    public void setVida(int vida) {
        this.dronVida = vida;
    }

    public void setMunicion(int municion) {
        this.dronMunicion = municion;
    }

    public void setRecargas(int recargas) {
        this.dronRecargas = recargas;
    }
}
