package com.wardrones.warDrones.model.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wardrones.warDrones.game.session.GameSession;
import com.wardrones.warDrones.game.session.GameSessionManager;
import com.wardrones.warDrones.model.entity.Partida;
import com.wardrones.warDrones.model.entity.Usuario;
import com.wardrones.warDrones.model.repository.PartidaRepository;
import com.wardrones.warDrones.model.repository.UsuarioRepository;

@Service
public class PartidaService {

    private final PartidaRepository pRepository;
    private final UsuarioRepository uRepository;
    private final GameSessionManager gameSManager;
    private final LobbyNotifier lobbyNotifier;

    public PartidaService(
            PartidaRepository ppRepository,
            UsuarioRepository puRepository,
            GameSessionManager gsm,
            LobbyNotifier lobbyNotifier
    ) {
        this.pRepository = ppRepository;
        this.uRepository = puRepository;
        this.gameSManager = gsm;
        this.lobbyNotifier = lobbyNotifier;
    }

    @Transactional
    public Partida crearPartida(int usuarioId) {
        Usuario creador = uRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Partida game = new Partida(creador, true);
        return pRepository.save(game);
    }

    public List<Partida> obtenerPartidasGuardadas(int usuarioId) {
        return pRepository.findByPartidaUsuarioId1_UsuarioIdOrPartidaUsuarioId2_UsuarioId(usuarioId, usuarioId);
    }

    public Partida obtenerPartida(int id) {
        return pRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Partida no encontrada"));
    }

    public boolean cambiarTurno(int partidaId, int usuarioId) {
        try {
            GameSession gs = gameSManager.obtenerSesion(partidaId);
            if (gs == null) throw new RuntimeException("Sesion no encontrada");

            gs.validarTurno(usuarioId);
            gs.cambiarTurno();

            return true;

        } catch (IllegalStateException e) {
            return false;
        }
    }

    @Transactional
    public Partida crearOUnirse(int usuarioId) {
        var abierta = pRepository.buscarPartidaAbierta();

        if (abierta.isPresent()) {
            Partida p = abierta.get();

            Usuario u2 = uRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            p.setUsuario2(u2);

            // crear sesion de juego
            gameSManager.crearSesion(p);

            // notificar al user 1 (si existe)
            if (p.getUsuarioId1() != null) {
                try {
                    lobbyNotifier.notifyUser(p.getUsuarioId1().getId(), p.getPartidaId());
                } catch (Exception e) {
                    // ignorar
                }
            }

            return pRepository.save(p);
        }

        return crearPartida(usuarioId);
    }
}
