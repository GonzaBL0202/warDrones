package com.wardrones.warDrones.model.entity;

import jakarta.persistence.*;

@Entity
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long usuarioId;

    @Column(nullable = false, unique = true)
    private String usuarioNombre;

    protected Usuario(){} //JPA requiere un constructor sin argumentos para crear instancias de la entidad.

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
