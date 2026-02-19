package com.wardrones.warDrones.model.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.wardrones.warDrones.model.entity.Partida;
import com.wardrones.warDrones.model.entity.Usuario;
import com.wardrones.warDrones.model.repository.PartidaRepository;
import com.wardrones.warDrones.model.repository.UsuarioRepository;

@Service
public class PartidaService {

    private final PartidaRepository pRepository;
    private final UsuarioRepository uRepository;

    public PartidaService(PartidaRepository ppRepository,
                        UsuarioRepository puRepository) {
        this.pRepository = ppRepository;
        this.uRepository = puRepository;
    }

    public Partida crearPartida(int usuarioId) {

        Usuario creador = uRepository.findById(usuarioId).orElseThrow(
            () -> new RuntimeException("Usuario no encontrado")
        );

        Partida game = new Partida(creador,true);
        return pRepository.save(game);

    }

    public List<Partida> obtenerPartidasGuardadas(int usuarioId) {
        return pRepository.findByPartidaUsuarioId1_UsuarioIdOrPartidaUsuarioId2_UsuarioId(usuarioId, usuarioId);
    }

    public Partida obtenerPartida(int id) {
        return pRepository.findById(id).orElseThrow(
            () -> new RuntimeException("Partida no encontrada")
        );
    }
}
