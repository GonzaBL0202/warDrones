package com.wardrones.warDrones.game.session;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.wardrones.warDrones.model.entity.Partida;

//GameSessionManager: Es utilizado para si se necesita poder mantener en memoria mas de una partida activa, aqui se guardan, obtienen y borran

@Component
public class GameSessionManager {

    private final Map<Integer, GameSession> partidasActivas = new ConcurrentHashMap<>();
    

    public GameSession crearSesion(Partida partida) {
        GameSession session = new GameSession(partida);
        partidasActivas.put(partida.getPartidaId(), session);
        return session;
    }

    public GameSession obtenerSesion(int partidaId) {
        return partidasActivas.get(partidaId);
    }

    public void cerrarSesion(int partidaId) {
        partidasActivas.remove(partidaId);
    }

    public Map<Integer,GameSession> getPartidas(){
        return partidasActivas;
    }
}

