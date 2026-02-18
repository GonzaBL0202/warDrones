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
}
