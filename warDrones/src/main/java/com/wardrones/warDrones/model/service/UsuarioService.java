//Servicios es a lo que llaman los controladores, y estos acceden a los repositorios. Permiten utilizar las funciones internas
package com.wardrones.warDrones.model.service;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.wardrones.warDrones.model.dto.response.RankingVictoriasResponse;
import com.wardrones.warDrones.model.entity.Usuario;
import com.wardrones.warDrones.model.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository uRepository;

    public UsuarioService(UsuarioRepository uRepository) {
        this.uRepository = uRepository;
    }

    public Usuario login(String username) {

        return uRepository.findByUsuarioNombre(username).orElseGet(() -> {
            Usuario nuevoUsuario = new Usuario(username);
            return uRepository.save(nuevoUsuario);
        });
    }

    public List<RankingVictoriasResponse> getRankingVictorias(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 100)); // límite 
        Pageable pageable = PageRequest.of(0, safeLimit);

        return uRepository
                .findRankingVictorias(pageable)
                .stream()
                .map(u -> new RankingVictoriasResponse(u.getId(), u.getNombre(), u.getCantVictorias()))
                .toList();
    }

}
