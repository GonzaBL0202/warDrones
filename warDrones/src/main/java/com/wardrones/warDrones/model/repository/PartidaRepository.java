package com.wardrones.warDrones.model.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.wardrones.warDrones.model.entity.Partida;
//import com.wardrones.warDrones.model.enums.*;

@Repository
public interface PartidaRepository extends JpaRepository<Partida, Integer> {

    @Query("""
        SELECT p FROM Partida p
        WHERE p.partidaEstado = Estado.CREADA
        AND p.partidaUsuarioId2 IS NULL
    """)
    Optional<Partida> buscarPartidaAbierta();

    List<Partida> findByPartidaUsuarioId1_UsuarioIdOrPartidaUsuarioId2_UsuarioId(int usuarioId1, int usuaruioId2);

    @Query("""
        SELECT p FROM Partida p
        WHERE (p.partidaUsuarioId1.usuarioId = :usuarioId
        OR p.partidaUsuarioId2.usuarioId = :usuarioId)
    """)
    List<Partida> buscarPartidasGuardadas(@Param("usuarioId") int usuarioId);

    @Query("""
        SELECT p FROM Partida p
        WHERE (p.partidaUsuarioId1.usuarioId = :usuarioId
        OR p.partidaUsuarioId2.usuarioId = :usuarioId)
        AND (p.partidaEstado = com.wardrones.warDrones.model.enums.Estado.GUARDADA
        OR p.partidaEstado = com.wardrones.warDrones.model.enums.Estado.REANUDANDO)
    """)
    List<Partida> buscarPartidasReanudables(@Param("usuarioId") int usuarioId);
}
