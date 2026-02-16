package com.wardrones.warDrones.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.wardrones.warDrones.model.dto.request.LoginRequest;
import com.wardrones.warDrones.model.entity.Usuario;
import com.wardrones.warDrones.model.service.UsuarioService;

@RestController
@CrossOrigin
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    public ResponseEntity<Usuario> login( @RequestBody LoginRequest request) {

        Usuario usuario = usuarioService.login(request.getUsername() );

        return ResponseEntity.ok(usuario);
    }

}
