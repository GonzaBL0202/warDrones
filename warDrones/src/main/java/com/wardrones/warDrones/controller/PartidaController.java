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
import com.wardrones.warDrones.model.dto.request.*;
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

    //Endpoints dentro de la partida:

    // @PostMapping("/accion")
    // public ResponseEntity<Boolean> realizarAccion(@RequestBody AccionRequest request){

    //     boolean hecho = pService.cambiarTurno(
    //             request.getPartidaId(),
    //             request.getUsuarioId()
    //     );

    //     return ResponseEntity.ok(hecho);
    // }

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
    @PostMapping("/atacarDronOPorta")
    public ResponseEntity<?> atacarDronOPorta(@RequestBody AtacarDronOPortaRequest dto) {

        pService.atacarDronOPorta(
            dto.getPartidaId(),
            dto.getJugadorId(),
            dto.getDronAtacanteId(),
            dto.getDronObjetivoId()
        );
        return ResponseEntity.ok().build();
    }

    //post de recargar
    @PostMapping("/recargarDron")
    public ResponseEntity<?> recargarDron(@RequestBody RecargarDronRequest dto) {

        pService.recargarDron(
            dto.getPartidaId(),
            dto.getJugadorId(),
            dto.getDronId()
        );
        return ResponseEntity.ok().build();
    }

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

    @GetMapping("/cargar/{usuarioId}")
    public List<Partida> cargarPartidas(@PathVariable int usuarioId) {
        return pService.obtenerPartidasGuardadas(usuarioId);
    }

    //----------- Abandono de partida -----------
    @PutMapping("/partida/renunciar/{partidaId}")
    public ResponseEntity<?> renunciar(@PathVariable int partidaId) {
        pService.renunciarPartida(partidaId);
        return ResponseEntity.ok().build();
    }

    //-----------Guardado de partida -----------
    @PutMapping("/partida/guardar/{partidaId}")
    public ResponseEntity<?> guardar(@PathVariable int partidaId) {
        pService.guardarPartida(partidaId);
        return ResponseEntity.ok().build();
    }

    //-------------Carga de partidas guardadas --------
    @GetMapping("/partida/reanudables/{usuarioId}")
    public List<Partida> reanudables(@PathVariable int usuarioId){
        return pService.obtenerPartidasReanudables(usuarioId);
    }

    @PutMapping("/partida/reanudar/{partidaId}")
    public ResponseEntity<?> reanudar(@PathVariable int partidaId){
        pService.marcarReanudando(partidaId);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/partida/reanudar/unirse/{partidaId}")
    public ResponseEntity<?> unirseReanudando(
        @PathVariable int partidaId,
        @RequestParam int usuarioId)
        {
            pService.unirseReanudando(partidaId, usuarioId);
            return ResponseEntity.ok().build();
        }
    
}
    

