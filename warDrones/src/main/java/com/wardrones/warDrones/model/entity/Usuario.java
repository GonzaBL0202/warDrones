package com.wardrones.warDrones.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int usuarioId;

    @Column(nullable = false, unique = true)
    private String usuarioNombre;

    private int usuarioCantVictorias;

    public Usuario(){
    }
    
    public Usuario(String nombre){
        this.usuarioNombre = nombre.trim();
    };

    public int getId(){
        return usuarioId;
    }
    
    public String getNombre(){
        return usuarioNombre;
    }

    public int getCantVictorias(){
        return usuarioCantVictorias;
    }

    //Funcion temporal

    public void setId(int id){
        this.usuarioId = id;
    }
}
