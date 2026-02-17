package com.wardrones.warDrones.model.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.wardrones.warDrones.model.entity.Usuario;
import com.wardrones.warDrones.service.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    public static class UsuarioRequest {
        public String username;
    }

    @PostMapping("/registrar")
    public Usuario registrarUsuario(@RequestBody UsuarioRequest request) {
        try {
        if (request == null || request.username == null || request.username.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre de usuario no puede estar vacío");
        }
        return usuarioService.registrar(request.username);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
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
