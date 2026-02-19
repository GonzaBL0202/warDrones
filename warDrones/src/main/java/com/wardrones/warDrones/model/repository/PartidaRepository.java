package com.wardrones.warDrones.model.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wardrones.warDrones.model.entity.Partida;

@Repository
public interface PartidaRepository extends JpaRepository<Partida, Integer> {

    List<Partida> findByPartidaUsuarioId1_UsuarioIdOrPartidaUsuarioId2_UsuarioId(int usuarioId1, int usuaruioId2);

}