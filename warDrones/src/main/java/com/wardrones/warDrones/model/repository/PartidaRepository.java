package com.wardrones.warDrones.model.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wardrones.warDrones.model.entity.Partida;

@Repository
public interface PartidaRepository extends JpaRepository<Partida, Long> {
}
