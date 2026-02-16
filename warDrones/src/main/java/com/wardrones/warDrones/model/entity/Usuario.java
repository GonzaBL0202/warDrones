package com.wardrones.warDrones.model.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long usuarioId;

    private String usuarioNombre;

    private int usuarioCantVictorias;

    public Usuario(String nombre){
        this.usuarioNombre = nombre.trim();
    };

    public Long getId(){
        return usuarioId;
    }
    
    public String getNombre(){
        return usuarioNombre;
    }

    public int getCantVictorias(){
        return usuarioCantVictorias;
    }
}
