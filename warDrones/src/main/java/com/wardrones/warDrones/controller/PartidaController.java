package com.wardrones.warDrones.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.wardrones.warDrones.model.dto.request.CrearPartidaRequest;
import com.wardrones.warDrones.model.dto.request.MovimientoDronRequest;
import com.wardrones.warDrones.model.dto.request.MovimientoPortadronRequest;
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


    //Endpoints dentro de la partida:

     @PostMapping("/accion")
    public ResponseEntity<Boolean> realizarAccion(@RequestBody AccionRequest request){

        boolean hecho = pService.cambiarTurno(
                request.getPartidaId(),
                request.getUsuarioId()
        );

        return ResponseEntity.ok(hecho);
    }

    @PostMapping("/moverDron")
    public ResponseEntity<?> moverDron(@RequestBody MovimientoDronRequest dto) {

        pService.moverDron(
                dto.getPartidaId(),
                dto.getJugadorId(),
                dto.getDronId(),
                dto.getX(),
                dto.getY()
        );

    return ResponseEntity.ok().build();

    }

    @PostMapping("/moverPortadron")
    public ResponseEntity<?> moverPortadron(@RequestBody MovimientoPortadronRequest dto) {

        pService.moverPortadron(
                dto.getPartidaId(),
                dto.getJugadorId(),
                dto.getX(),
                dto.getY()
        );

        return ResponseEntity.ok().build();
    }

    //post de atacar

    //post de recargar

    //get generico para todas las acciones



    //Endpoints generales:

    @PostMapping("/iniciarPartida/{partidaId}")
    public ResponseEntity<?> iniciarPartida(@PathVariable int partidaId) {

        pService.iniciarPartida(partidaId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/partida/usuario/{usuario_id}")
    public String getMethodName(@RequestParam String param) {
        return new String();
    }
    
    @PutMapping("/partida/salir/{partidaId}")
    public ResponseEntity<?> salirPartida(@PathVariable int partidaId) {

    pService.salirPartida(partidaId);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/cargar/{usuarioId}")
    public List<Partida> cargarPartidas(@PathVariable int usuarioId) {
        return pService.obtenerPartidasGuardadas(usuarioId);
    }

}


