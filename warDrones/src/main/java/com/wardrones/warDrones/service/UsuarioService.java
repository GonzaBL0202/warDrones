//Servicios es a lo que llaman los controladores, y estos acceden a los repositorios. Permiten utilizar las funciones internas


package com.wardrones.warDrones.service;

import org.springframework.stereotype.Service;
import com.wardrones.warDrones.model.entity.Usuario;
import com.wardrones.warDrones.repository.UsuarioRepository;
import java.util.Objects;
@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario registrar(String username) {

        Objects.requireNonNull(username, "El nombre de usuario no puede ser null");

        String trimmedUsername = username.trim(); // Eliminar espacios en blanco al inicio y al final
        if (trimmedUsername.isEmpty()) {
            throw new IllegalArgumentException("El nombre de usuario no puede estar vacío");
        }
        if (usuarioRepository.findByUsuarioNombre(trimmedUsername).isPresent()) {
            throw new IllegalArgumentException("El usuario ya existe");
        }

        Usuario user = new Usuario(trimmedUsername);

        return usuarioRepository.save(user);
    }

    public Usuario login(String username) {

        Usuario usuario = usuarioRepository
                .findByUsuarioNombre(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return usuario;
    }
}

