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
public class Dron {

    protected Dron(){} //JPA requiere un constructor sin argumentos para crear instancias de la entidad.
    
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


    // Getters
    public int getId() {
        return dronId;
    }

    public Portadron getPartidaId() {
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
}
