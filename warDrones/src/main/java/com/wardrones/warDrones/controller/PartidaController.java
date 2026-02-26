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

import com.wardrones.warDrones.game.session.GameSession;
import com.wardrones.warDrones.model.dto.request.AsignarBandosRequest;
import com.wardrones.warDrones.model.dto.request.AtacarDronOPortaRequest;
import com.wardrones.warDrones.model.dto.request.CrearPartidaRequest;
import com.wardrones.warDrones.model.dto.request.MovimientoDronRequest;
import com.wardrones.warDrones.model.dto.request.MovimientoPortadronRequest;
import com.wardrones.warDrones.model.dto.request.RecargarDronRequest;
import com.wardrones.warDrones.model.dto.response.IniciarPartidaResponse;
import com.wardrones.warDrones.model.dto.response.ObtenerPartidaInfoResponse;
import com.wardrones.warDrones.model.entity.Partida;
import com.wardrones.warDrones.model.enums.Bando;
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
        try {
            pService.moverDron(
                    dto.getPartidaId(),
                    dto.getJugadorId(),
                    dto.getDronId(),
                    dto.getX(),
                    dto.getY()
            );
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error moverDron: " + e.getMessage());
            return ResponseEntity.badRequest().body("{\"success\": false, \"error\": \"" + e.getMessage() + "\"}");
        }

    }

    @PostMapping("/desplegarDron")
    public ResponseEntity<?> desplegarDron(@RequestBody com.wardrones.warDrones.model.dto.request.DesplegarDronRequest dto) {
        try {
            pService.desplegarDron(dto.getPartidaId(), dto.getJugadorId(), dto.getDronId(), dto.getX(), dto.getY());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error desplegarDron: " + e.getMessage());
            return ResponseEntity.badRequest().body("{\"success\": false, \"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/moverPortadron")
    public ResponseEntity<?> moverPortadron(@RequestBody MovimientoPortadronRequest dto) {
        try {
            pService.moverPortadron(
                    dto.getPartidaId(),
                    dto.getJugadorId(),
                    dto.getX(),
                    dto.getY()
            );
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error moverPortadron: " + e.getMessage());
            return ResponseEntity.badRequest().body("{\"success\": false, \"error\": \"" + e.getMessage() + "\"}");
        }
    }

    //post de atacar
    @PostMapping("/atacarDronOPorta")
    public ResponseEntity<?> atacarDronOPorta(@RequestBody AtacarDronOPortaRequest dto) {
        try {
            pService.atacarDronOPorta(
                dto.getPartidaId(),
                dto.getJugadorId(),
                dto.getDronAtacanteId(),
                dto.getDronObjetivoId()
            );
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error atacarDronOPorta: " + e.getMessage());
            return ResponseEntity.badRequest().body("{\"success\": false, \"error\": \"" + e.getMessage() + "\"}");
        }
    }

    //post de recargar
    @PostMapping("/recargarDron")
    public ResponseEntity<?> recargarDron(@RequestBody RecargarDronRequest dto) {
        try {
            pService.recargarDron(
                dto.getPartidaId(),
                dto.getJugadorId(),
                dto.getDronId()
            );
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error recargarDron: " + e.getMessage());
            return ResponseEntity.badRequest().body("{\"success\": false, \"error\": \"" + e.getMessage() + "\"}");
        }
    }

    //get generico para todas las acciones



    //Endpoints generales:

    @PostMapping("/iniciarPartida/{partidaId}")
    public ResponseEntity<IniciarPartidaResponse> iniciarPartida(@PathVariable int partidaId) {
        System.out.println("Iniciando partida con ID: " + partidaId);
        GameSession gs = pService.iniciarPartida(partidaId);
        
        if (gs == null) {
            IniciarPartidaResponse response = new IniciarPartidaResponse(false, 0, null, "Error al iniciar partida");
            return ResponseEntity.ok(response);
        }
        
        int bandosDesplegados = gs.getBandosDesplegados();
        boolean iniciada = bandosDesplegados == 2;
        Integer jugadorEnTurno = iniciada ? gs.getJugadorEnTurno() : null;
        
        IniciarPartidaResponse response = new IniciarPartidaResponse(
            iniciada,
            bandosDesplegados,
            jugadorEnTurno,
            iniciada ? "Partida iniciada" : "Esperando segundo jugador"
        );
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/asignarBandos")
    public ResponseEntity<?> asignarBandos(@RequestBody AsignarBandosRequest request) {
        System.out.println("Asignando bandos: Partida=" + request.getPartidaId() + 
                         ", Bando1=" + request.getBando1() + ", Bando2=" + request.getBando2());
        
        try {
            String bando1Str = request.getBando1().toUpperCase();
            String bando2Str = request.getBando2().toUpperCase();
            
            Bando bando1 = 
                bando1Str.equals("NAVAL") ? Bando.NAVAL : Bando.AEREO;
            
            Bando bando2 = bando2Str.equals("NAVAL") ? Bando.NAVAL : Bando.AEREO;
            
            pService.asignarBandos(request.getPartidaId(), bando1, bando2);
            
            return ResponseEntity.ok().body("{\"success\": true, \"mensaje\": \"Bandos asignados correctamente\"}");
        } catch (Exception e) {
            System.err.println("Error asignando bandos: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("{\"success\": false, \"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/obtenerPartidaInfo/{partidaId}")
    public ResponseEntity<ObtenerPartidaInfoResponse> obtenerPartidaInfo(@PathVariable int partidaId) {
        try {
            ObtenerPartidaInfoResponse response = pService.obtenerPartidaInfo(partidaId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error obteniendo info de partida: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
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
    

