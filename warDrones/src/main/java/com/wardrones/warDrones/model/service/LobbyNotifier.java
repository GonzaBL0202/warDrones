package com.wardrones.warDrones.model.service;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Component
public class LobbyNotifier {

    private final Map<Integer, SseEmitter> emitters = new ConcurrentHashMap<>();
    
    public SseEmitter register(int usuarioId) {
        SseEmitter emitter = new SseEmitter(0L); // no timeout
        emitters.put(usuarioId, emitter);

        emitter.onCompletion(() -> emitters.remove(usuarioId));
        emitter.onTimeout(() -> emitters.remove(usuarioId));
        emitter.onError((ex) -> emitters.remove(usuarioId));

        try {
            emitter.send(SseEmitter.event().name("connected").data("ok"));
        } catch (IOException e) {
            // ignore
        }

        return emitter;
    }

    public void notifyUser(int usuarioId, int partidaId) {
        SseEmitter emitter = emitters.get(usuarioId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name("partida-start").data(String.valueOf(partidaId)));
                emitter.complete();
            } catch (IOException e) {
                // remove emitter on error
            } finally {
                emitters.remove(usuarioId);
            }
        }
    }
}
