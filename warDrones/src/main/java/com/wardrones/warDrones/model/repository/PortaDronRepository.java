package com.wardrones.warDrones.model.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.wardrones.warDrones.model.entity.Portadron;
import com.wardrones.warDrones.model.entity.Usuario;

@Repository
public interface PortaDronRepository extends JpaRepository<Portadron, Integer> {
    Optional<Usuario> findByPortadronId(Integer portadronId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "DELETE FROM portadron WHERE portadronpartida_id = :partidaId", nativeQuery = true)
    void deleteByPartidaId(@Param("partidaId") int partidaId);
}
