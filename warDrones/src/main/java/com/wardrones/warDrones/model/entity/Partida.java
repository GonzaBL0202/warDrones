package com.wardrones.warDrones.model.entity;

import com.wardrones.warDrones.model.enums.Bando;
import com.wardrones.warDrones.model.enums.Estado;

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
    
    @Enumerated(EnumType.STRING)
    private Estado partidaEstado;

    //matriz de niebla de guerra serialized as JSON (rows×cols boolean grid) 
    @jakarta.persistence.Column(columnDefinition = "TEXT")
    private String discovered;

    //private boolean partidaActiva;

    //Constructora
    public Partida(){}

    public Partida(Usuario u1, Estado estado) {
        this.partidaUsuarioId1 = u1;
        this.partidaTurno = u1.getId();
        this.partidaEstado = estado;
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

    public Estado getPartidaEstado() {
        return partidaEstado;
    }

    // getter / setter for fog string
    public String getNieblaDescubierta() {
        return discovered;
    }

    public void setNieblaDescubierta(String discovered) {
        this.discovered = discovered;
    }

    //Setters
    public void setUsuario2(Usuario u2){
        this.partidaUsuarioId2 = u2;
    }

    public void setPartidaEstado(Estado estado) {
        this.partidaEstado = estado;
    }

}


