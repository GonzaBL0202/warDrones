package com.wardrones.warDrones.model.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.wardrones.warDrones.model.entity.Partida;

@Repository
public interface PartidaRepository extends JpaRepository<Partida, Integer> {
    @Query("SELECT p FROM Partida p WHERE p.partidaActiva = true AND p.partidaUsuarioId2 IS NULL")
    Optional<Partida> buscarPartidaAbierta();

}
