package com.wardrones.warDrones.model.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.wardrones.warDrones.game.session.GameSession;
import com.wardrones.warDrones.game.session.GameSessionManager;
import com.wardrones.warDrones.model.entity.Partida;
import com.wardrones.warDrones.model.entity.Usuario;
import com.wardrones.warDrones.model.enums.Estado;
import com.wardrones.warDrones.model.repository.PartidaRepository;
import com.wardrones.warDrones.model.repository.UsuarioRepository;

import jakarta.transaction.Transactional;



@Service
public class PartidaService {

    private final PartidaRepository pRepository;
    private final UsuarioRepository uRepository;
    private final GameSessionManager gameSManager;
    private final LobbyNotifier lobbyNotifier;

    public PartidaService(PartidaRepository ppRepository,UsuarioRepository puRepository, GameSessionManager gsm, LobbyNotifier lobbyNotifier ) {
        this.pRepository = ppRepository;
        this.uRepository = puRepository;
        this.gameSManager = gsm;
        this.lobbyNotifier = lobbyNotifier;
    }

    public Partida crearPartida(int usuarioId) {

        Usuario creador = uRepository.findById(usuarioId).orElseThrow(
            () -> new RuntimeException("Usuario no encontrado")
        );
        
        Partida game = pRepository.buscarPartidaAbierta(Estado.CREADA).orElse(null);  //Busca una partida activa sin jugador 2, sino encuentra asigna null

        if (game == null)
            game = new Partida(creador,Estado.CREADA);                           //Si esta en null, crea una nueva
        else{
            Usuario u2 = uRepository.findById(usuarioId).orElse(null);
            if (u2 != null){
                game.setUsuario2(u2);
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
        
        return pRepository.save(game);     //Aca se persiste en bd
    }

    public Partida obtenerPartida(int id) {
        return pRepository.findById(id).orElseThrow(
            () -> new RuntimeException("Partida no encontrada")
        );
    }

    public boolean cambiarTurno(int partidaId, int usuarioId){

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
        }catch(Exception e){}
    
    try {
        lobbyNotifier.notifyPartidaFinalizada(
            partida.getUsuarioId2().getId(),
            partidaId);
        }catch(Exception e){}
}

@Transactional
public void guardarPartida(int partidaId) {
    Partida partida = pRepository.findById(partidaId).orElseThrow(
        () -> new RuntimeException("Partida no encontrada")
    );
    partida.setPartidaEstado(Estado.GUARDADA);
    pRepository.save(partida);

    //Sacar ambos al menu principal al guardar la partida
    try{
        lobbyNotifier.notifyPartidaGuardada(
            partida.getUsuarioId1().getId(),
            partidaId);
    }catch(Exception e){}
    try{
        lobbyNotifier.notifyPartidaGuardada(
            partida.getUsuarioId2().getId(),
            partidaId);
        }catch(Exception e){}
}}
