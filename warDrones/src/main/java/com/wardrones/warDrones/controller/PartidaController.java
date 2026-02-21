package com.wardrones.warDrones.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.wardrones.warDrones.model.dto.request.AccionRequest;
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
    public ResponseEntity<Partida> crearPartida(@RequestBody CrearPartidaRequest request) {
        Partida partida = pService.crearPartida(request.getUsuarioId());
        return ResponseEntity.ok(partida);
    }

    @PostMapping("/accion")
    public ResponseEntity<Boolean> realizarAccion(@RequestBody AccionRequest request) {
        boolean hecho = pService.cambiarTurno(
                request.getPartidaId(),
                request.getUsuarioId()
        );
        return ResponseEntity.ok(hecho);
    }

    @GetMapping("/partida/usuario/{usuarioId}")
    public ResponseEntity<List<Partida>> obtenerPartidasDeUsuario(@PathVariable int usuarioId) {
        return ResponseEntity.ok(pService.obtenerPartidasGuardadas(usuarioId));
    }

    @PostMapping("/partida/crearOUnirse")
    public ResponseEntity<Partida> crearOUnirse(@RequestBody CrearPartidaRequest request) {
        Partida partida = pService.crearOUnirse(request.getUsuarioId());
        return ResponseEntity.ok(partida);
    }
}
