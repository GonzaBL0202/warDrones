//Servicios es a lo que llaman los controladores, y estos acceden a los repositorios. Permiten utilizar las funciones internas


package com.wardrones.warDrones.model.service;

import org.springframework.stereotype.Service;

import com.wardrones.warDrones.model.entity.Usuario;
import com.wardrones.warDrones.model.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository uRepository;

    public UsuarioService(UsuarioRepository uRepository) {
        this.uRepository = uRepository;
    }

    public Usuario login(String username) {

        return uRepository.findByUsuarioNombre(username).orElseGet(() -> {
                    Usuario nuevoUsuario = new Usuario(username);
                    return uRepository.save(nuevoUsuario);
                });
    }
}

