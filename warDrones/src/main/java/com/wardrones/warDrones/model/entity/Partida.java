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
public class Partida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int partidaId;

    @ManyToOne
    @JoinColumn(name = "usuario1_id")
    private Usuario partidaUsuarioId1;

    @ManyToOne
    @JoinColumn(name = "usuario2_id")
    private Usuario partidaUsuarioId2;

    @Enumerated(EnumType.STRING)
    private Bando partidaBando1;

    @Enumerated(EnumType.STRING)
    private Bando partidaBando2;

    private int partidaTurno;

    private boolean partidaActiva;

    //Constructora
    public Partida(){}

    public Partida(Usuario u1, boolean activa){
        this.partidaUsuarioId1 = u1;
        this.partidaActiva = activa;
    }

    // Getters

    public int getPartidaId() {
        return partidaId;
    }

    public Usuario getUsuarioId1() {
        return partidaUsuarioId1;
    }

    public Usuario getUsuarioId2() {
        return partidaUsuarioId2;
    }

    public Bando getBando1() {
        return partidaBando1;
    }

    public Bando getBando2() {
        return partidaBando2;
    }

    public int getTurno() {
        return partidaTurno;
    }

    public boolean getActiva() {
        return partidaActiva;
    }
}
