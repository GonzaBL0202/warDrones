//Repository es la capa que se encarga de comunicarse con la base de datos. Es la abstracción entre la lógica de negocio (Service) y MySQL.
//Nos permite acceder a metodos CRUD sin crearlos

package com.wardrones.warDrones.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wardrones.warDrones.model.entity.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsuarioNombre(String username);
}



