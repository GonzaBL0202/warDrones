package com.wardrones.warDrones.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.wardrones.warDrones.model.dto.request.CrearPartidaRequest;
import com.wardrones.warDrones.model.entity.Partida;
import com.wardrones.warDrones.model.service.PartidaService;

@RestController
@CrossOrigin
public class PartidaController {

    private final PartidaService pService;

    public PartidaController(PartidaService partidaService) {
        this.pService = partidaService;
    }

    @PostMapping("/partidas")
    public ResponseEntity<Partida> crearPartida( @RequestBody CrearPartidaRequest request) {

        Partida partida = pService.crearPartida( request.getUsuarioId() );

        return ResponseEntity.ok(partida);
    }
}
