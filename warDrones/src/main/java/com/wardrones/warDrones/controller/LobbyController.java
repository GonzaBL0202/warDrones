package com.wardrones.warDrones.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.wardrones.warDrones.model.service.LobbyNotifier;

@RestController
@CrossOrigin
public class LobbyController {

    private final LobbyNotifier lobbyNotifier;

    public LobbyController(LobbyNotifier lobbyNotifier) {
        this.lobbyNotifier = lobbyNotifier;
    }

    @GetMapping("/lobby/connect")
    public SseEmitter connect(@RequestParam int usuarioId) {
        return lobbyNotifier.register(usuarioId);
    }

}
