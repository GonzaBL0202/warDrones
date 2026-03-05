package com.wardrones.warDrones.model.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.wardrones.warDrones.model.entity.Dron;

@Repository
public interface DronRepository extends JpaRepository<Dron, Integer> {

    // Método personalizado para buscar un dron por su ID y el ID del portadron
    @Query("SELECT d FROM Dron d WHERE d.dronId = :dronId AND d.dronPortaDronId = :portadronId")
    Optional<Dron> buscarDronPorIdYPortadron(@Param("dronId") int dronId, @Param("portadronId") int portadronId);

    List<Dron> findByDronPortaDronId_Id(int portadronId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            DELETE FROM dron
            WHERE dronportadron_id IN (
                SELECT portadron_id
                FROM portadron
                WHERE portadronpartida_id = :partidaId
            )
            """, nativeQuery = true)
    void deleteByPartidaId(@Param("partidaId") int partidaId);
}
