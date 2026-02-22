package com.wardrones.warDrones.model.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.wardrones.warDrones.model.entity.Dron;


@Repository
public interface DronRepository extends JpaRepository<Dron, Integer> {
    
    @Query("SELECT d FROM Dron d WHERE d.dronId = ? AND d.portadronId = ?")
    Optional<Dron> buscarDronPorIdYPortadron(int dronId, int portadronId);
}