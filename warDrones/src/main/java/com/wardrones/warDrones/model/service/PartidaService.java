package com.wardrones.warDrones.model.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.wardrones.warDrones.game.session.GameSession;
import com.wardrones.warDrones.game.session.GameSessionManager;
import com.wardrones.warDrones.model.entity.Dron;
import com.wardrones.warDrones.model.entity.Partida;
import com.wardrones.warDrones.model.entity.Portadron;
import com.wardrones.warDrones.model.entity.Usuario;
import com.wardrones.warDrones.model.enums.Bando;
import com.wardrones.warDrones.model.enums.Estado;
import com.wardrones.warDrones.model.repository.DronRepository;
import com.wardrones.warDrones.model.repository.PartidaRepository;
import com.wardrones.warDrones.model.repository.PortaDronRepository;
import com.wardrones.warDrones.model.repository.UsuarioRepository;

import jakarta.transaction.Transactional;

//Service decide si los datos recibidos desde el controller deben destinarse hacia la persistencia de bd (Repository), hacia el juego en memoria (Gamesession) o ambas opciones

@Service
public class PartidaService {

    private final PartidaRepository pRepository;
    private final UsuarioRepository uRepository;
    private final PortaDronRepository pdRepository;
    private final DronRepository dRepository;
    private final GameSessionManager gameSManager;
    private final LobbyNotifier lobbyNotifier;

    public PartidaService(PartidaRepository ppRepository,UsuarioRepository puRepository, PortaDronRepository pdRepository, DronRepository dRepository,  GameSessionManager gsm, LobbyNotifier lobbyNotifier ) {
        this.pRepository = ppRepository;
        this.uRepository = puRepository;
        this.pdRepository = pdRepository;
        this.dRepository = dRepository; 
        this.gameSManager = gsm;
        this.lobbyNotifier = lobbyNotifier;
    }

    public Partida crearPartida(int usuarioId) {
        Usuario creador = uRepository.findById(usuarioId).orElseThrow(
                () -> new RuntimeException("Usuario no encontrado")
        );

        Partida game = pRepository.buscarPartidaAbierta().orElse(null);  //Busca una partida activa sin jugador 2, sino encuentra asigna null

        if (game == null) {
            game = new Partida(creador, Estado.CREADA);                           //Si esta en null, crea una nueva
        }else {
            Usuario u2 = uRepository.findById(usuarioId).orElse(null);
            if (u2 != null) {
                game.setUsuario2(u2);
                game.setPartidaEstado(Estado.EN_CURSO);
                gameSManager.crearSesion(game);                                 //Se crea en sesion solo cuando ya estan ambos usuarios
                if (game.getUsuarioId1() != null) {
                    try {
                        lobbyNotifier.notifyUser(game.getUsuarioId1().getId(), game.getPartidaId());
                    } catch (Exception e) {
                        // no interrumpir el flujo principal si la notificación falla
                    }
                }
            }
        }
        
        return pRepository.save(game);    //Aca se persiste en bd
    }

    public GameSession iniciarPartida(int partidaId) {
        Partida partida = pRepository.findById(partidaId).orElseThrow(() -> new RuntimeException("Partida not found"));

         try {
            GameSession gs = gameSManager.obtenerSesion(partidaId);
            if (gs == null) {
                throw new RuntimeException("Sesion no encontrada");
            }
            gs.setBandosDesplegados(gs.getBandosDesplegados()+1);
            if(gs.getBandosDesplegados() == 2){
                gs.setJugadorEnTurno(partida.getUsuarioId1().getId());   // El jugador 1 inicia la partida
                //llamado sse a ambos usuarios para comenzar
            }
            return gs; 

        } catch (IllegalStateException e) {
            return null;
        }
    }

    //Ya confirmado los bandos tenemos toda la info necesario y cargamos todos los valores de GameSession
    public GameSession asignarBandos(int partidaId, Bando b1, Bando b2) {
        Partida partida = pRepository.findById(partidaId).orElseThrow(
            () -> new RuntimeException("Partida no encontrada")
        );

         try {
            GameSession gs = gameSManager.obtenerSesion(partidaId);
            if (gs == null) {
                throw new RuntimeException("Sesion no encontrada");
            }

            gs.setBandos(b1, b2);
        
            Portadron p1 = new Portadron(partida, b1);
            pdRepository.save(p1);
            Portadron p2 = new Portadron(partida, b2);
            pdRepository.save(p2);

            gs.setPortadrones(p1, p2);

            Portadron aereo = (b1 == Bando.AEREO) ? p1 : p2;
            Portadron naval = (b1 == Bando.NAVAL) ? p1 : p2;

            List<Dron> drones = new ArrayList<>();
           
            for (int i = 0; i < 12; i++) {
                Dron d1 = new Dron(aereo, b1);
                dRepository.save(d1);
                drones.add(d1);
            }

            for (int i = 0; i < 6; i++) {
                Dron d2 = new Dron(naval, b2);
                dRepository.save(d2);
                drones.add(d2);
            }

            gs.setDrones(drones);
            
            return gs; 

        } catch (IllegalStateException e) {
            return null;
        }
    }
    
    
    public Partida obtenerPartida(int id) {
        return pRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Partida no encontrada")
        );
    }

    public boolean cambiarTurno(int partidaId, int usuarioId) {

        try {
            GameSession gs = gameSManager.obtenerSesion(partidaId);
            if (gs == null) {
                throw new RuntimeException("Sesion no encontrada");
            }

            gs.validarTurno(usuarioId);   // valida que sea su turno
            gs.cambiarTurno();            // alterna internamente

            return true;

        } catch (IllegalStateException e) {
            return false;
        }
    }

  

    //Acciones dentro de la partida

    public void moverDron(int partidaId, int jugadorId, int dronId, int x, int y) {

        GameSession session = gameSManager.obtenerSesion(partidaId);
        session.moverDron(dronId, x, y, jugadorId);
        session.cambiarTurno();
    }

    public void moverPortadron(int partidaId, int jugadorId, int x, int y) {
        GameSession session = gameSManager.obtenerSesion(partidaId);
        session.moverPortadron(x, y, jugadorId);//
        session.cambiarTurno();
    }

    public void atacarDronOPorta(int partidaId, int jugadorId, int dronA, int obj) {
        GameSession session = gameSManager.obtenerSesion(partidaId);
        if(obj == 0)
            session.atacarPortadron(dronA, jugadorId);
        else
            session.atacarDron(dronA, obj, jugadorId);
        session.cambiarTurno();
    }

    public void recargarDron (int partidaId, int jugadorId, int dronId) {
        GameSession session = gameSManager.obtenerSesion(partidaId);
        session.recargarDron(dronId, jugadorId);
        session.cambiarTurno();
    }

    //ver si el del get tb va////

    public List<Partida> obtenerPartidasGuardadas(int usuarioId) {
        return pRepository.buscarPartidasGuardadas(usuarioId);
    }

//------------Abandono de partida -----------
    @Transactional
    public void renunciarPartida(int partidaId) {
        Partida partida = pRepository.findById(partidaId).orElseThrow(
                () -> new RuntimeException("Partida no encontrada")
        );
        partida.setPartidaEstado(Estado.FINALIZADA);
        pRepository.save(partida);

        //Aviso a ambos jugadores que la partida ha finalizado al renunciar uno
        try {
            lobbyNotifier.notifyPartidaFinalizada(
                    partida.getUsuarioId1().getId(),
                    partidaId);
        } catch (Exception e) {
        }

        try {
            lobbyNotifier.notifyPartidaFinalizada(
                    partida.getUsuarioId2().getId(),
                    partidaId);
        } catch (Exception e) {
        }
    }

    @Transactional
    public void guardarPartida(int partidaId) {
        Partida partida = pRepository.findById(partidaId).orElseThrow(
                () -> new RuntimeException("Partida no encontrada")
        );
        partida.setPartidaEstado(Estado.GUARDADA);
        pRepository.save(partida);

        //Sacar ambos al menu principal al guardar la partida
        try {
            lobbyNotifier.notifyPartidaGuardada(
                    partida.getUsuarioId1().getId(),
                    partidaId);
        } catch (Exception e) {
        }
        try {
            lobbyNotifier.notifyPartidaGuardada(
                    partida.getUsuarioId2().getId(),
                    partidaId);
        } catch (Exception e) {
        }
    }
    
    public List<Partida> obtenerPartidasReanudables(int usuarioId){
        return pRepository.buscarPartidasReanudables(usuarioId);
    }

    @Transactional
    public void marcarReanudando(int partidaId){
        Partida partida = pRepository.findById(partidaId).orElseThrow(()-> new RuntimeException("Partida no encontrada."));
        partida.setPartidaEstado(Estado.REANUDANDO);
        pRepository.save(partida);
    }

    @Transactional
    public void unirseReanudando(int partidaId, int usuarioId) {
        Partida partida = pRepository.findById(partidaId)
        .orElseThrow(() -> new RuntimeException("Partida no encontrada."));

        partida.setPartidaEstado(Estado.EN_CURSO);
        pRepository.save(partida);

        gameSManager.crearSesion(partida);
        
        try{
            lobbyNotifier.notifyUser(partida.getUsuarioId1().getId(), partidaId);
        }catch(Exception e){}
        
        try {
            lobbyNotifier.notifyUser(partida.getUsuarioId2().getId(), partidaId);
        }catch (Exception e) {}

    }

    
}
