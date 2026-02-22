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

    //private boolean partidaActiva;

    //Constructora
    public Partida(){}

    public Partida(Usuario u1, Estado estado) {
        this.partidaUsuarioId1 = u1;
       // this.partidaActiva = activa;
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
    //public boolean getActiva() {
    //    return partidaActiva;
   // }
    //Setters
    public void setUsuario2(Usuario u2){
        this.partidaUsuarioId2 = u2;
    }

    public void setPartidaEstado(Estado estado) {
        this.partidaEstado = estado;
    }

    //public void setActiva(boolean estado){
    //    this.partidaActiva = estado;
    //}
    //public boolean isActiva(){
     //   return this.partidaActiva;
   // }
    //funciones temporales para hardcordear y probar en postman
    
    
    // public void setPartidaId(int id){
    //     this.partidaId = id;
    // }

    // public void setUsuario1(int id,String nombre){
    //     Usuario u = new Usuario(nombre);
    //     u.setId(id);
    //     this.partidaUsuarioId1 = u;
    // }

    // // public void setUsuario2(int id,String nombre){
    // //     Usuario u = new Usuario(nombre);
    // //     u.setId(id);
    // //     this.partidaUsuarioId2 = u;
    // // }

    // public void setActiva(){
    //     this.partidaActiva = true;
    // }

    // public void setBando1(){
    //     this.partidaBando1 = Bando.AEREO;
    // }

    // public void setBando2(){
    //     this.partidaBando2 = Bando.NAVAL;
    // }
    
    // public void setTurno(){
    //     this.partidaTurno = 3;
    // }

    // public void partidaHard(){
    //     this.setPartidaId(4);
    //     this.setUsuario1(1,"Gonzalo");
    //     this.setUsuario2(3,"Franco");
    //     this.setTurno();
    //     this.setActiva();
    //     this.setBando1();
    //     this.setBando2();
    // }
}


