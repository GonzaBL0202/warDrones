package com.wardrones.warDrones.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.wardrones.warDrones.model.dto.response.RankingVictoriasResponse;
import com.wardrones.warDrones.model.service.UsuarioService;

@RestController
@CrossOrigin
public class RankingController {

    private final UsuarioService usuarioService;

    public RankingController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/api/ranking/victorias")
    public List<RankingVictoriasResponse> rankingVictorias(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return usuarioService.getRankingVictorias(limit);
    }
}
