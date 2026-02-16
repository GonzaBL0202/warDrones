//Servicios es a lo que llaman los controladores, y estos acceden a los repositorios. Permiten utilizar las funciones internas


package com.wardrones.warDrones.service;

import org.springframework.stereotype.Service;

import com.wardrones.warDrones.model.entity.Usuario;
import com.wardrones.warDrones.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario registrar(String username, String password) {

        if (usuarioRepository.findByUsuarioNombre(username).isPresent()) {
            throw new RuntimeException("El usuario ya existe");
        }

        Usuario user = new Usuario(username);

        return usuarioRepository.save(user);
    }

    public Usuario login(String username) {

        Usuario usuario = usuarioRepository
                .findByUsuarioNombre(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return usuario;
    }
}

