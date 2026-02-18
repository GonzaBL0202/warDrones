package com.wardrones.warDrones.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.wardrones.warDrones.model.entity.Usuario;
import com.wardrones.warDrones.model.service.UsuarioService;

@RestController
@CrossOrigin
public class UsuarioController {
    
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    public static class UsuarioRequest {
        public String username;
    }

    @PostMapping("/login")
    public Usuario loginUsuario(@RequestBody UsuarioRequest request) {
        try {
        if (request == null || request.username == null || request.username.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre de usuario no puede estar vacío");
        }
        return usuarioService.login(request.username);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
}
