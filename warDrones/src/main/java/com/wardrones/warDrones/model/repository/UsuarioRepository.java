//Repository es la capa que se encarga de comunicarse con la base de datos. Es la abstracción entre la lógica de negocio (Service) y MySQL.
//Nos permite acceder a metodos CRUD sin crearlos

package com.wardrones.warDrones.model.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.wardrones.warDrones.model.entity.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByUsuarioNombre(String username);





    @Query("SELECT u FROM Usuario u ORDER BY u.usuarioCantVictorias DESC, u.usuarioId ASC")
    List<Usuario> findRankingVictorias(Pageable pageable);
}
