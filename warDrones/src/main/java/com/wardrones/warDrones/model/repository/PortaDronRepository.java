package com.wardrones.warDrones.model.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wardrones.warDrones.model.entity.Portadron;
import com.wardrones.warDrones.model.entity.Usuario;


@Repository
public interface PortaDronRepository extends JpaRepository<Portadron, Integer> {
    
     Optional<Usuario> findByPortadronId(Integer portadronId);
}