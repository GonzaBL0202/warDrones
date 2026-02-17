package com.wardrones.warDrones.service;

import org.springframework.stereotype.Service;
import java.util.Objects;
import com.wardrones.warDrones.model.entity.Partida;
import com.wardrones.warDrones.model.entity.Usuario;
import com.wardrones.warDrones.repository.PartidaRepository;
import com.wardrones.warDrones.repository.UsuarioRepository;

@Service
public class PartidaService {

    private final PartidaRepository partidaRepository;
    private final UsuarioRepository usuarioRepository;

    public PartidaService(PartidaRepository partidaRepository, UsuarioRepository usuarioRepository) {
        this.partidaRepository = partidaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public Partida crearPartida(Long usuarioId) {

        Objects.requireNonNull(usuarioId, "usuarioId no puede ser null");
        Usuario creador = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Partida game = new Partida(creador,true);
        return partidaRepository.save(game);
    }

    public Partida obtenerPartida(Long id) {

        Objects.requireNonNull(id, "id no puede ser null");

        return partidaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Partida no encontrada"));
    }
}
