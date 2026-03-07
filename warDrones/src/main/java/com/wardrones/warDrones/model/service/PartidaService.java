package com.wardrones.warDrones.model.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.wardrones.warDrones.game.session.GameSession;
import com.wardrones.warDrones.game.session.GameSessionManager;
import com.wardrones.warDrones.game.session.state.DronState;
import com.wardrones.warDrones.game.session.state.PortadronState;
import com.wardrones.warDrones.model.dto.response.ObtenerPartidaInfoResponse;
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

    public PartidaService(PartidaRepository ppRepository, UsuarioRepository puRepository,
            PortaDronRepository pdRepository, DronRepository dRepository, GameSessionManager gsm,
            LobbyNotifier lobbyNotifier) {
        this.pRepository = ppRepository;
        this.uRepository = puRepository;
        this.pdRepository = pdRepository;
        this.dRepository = dRepository;
        this.gameSManager = gsm;
        this.lobbyNotifier = lobbyNotifier;
    }

    public Partida crearPartida(int usuarioId) {
        Usuario creador = uRepository.findById(usuarioId).orElseThrow(
                () -> new RuntimeException("Usuario no encontrado"));

        Partida game = pRepository.buscarPartidaAbierta().orElse(null);

        if (game == null) {
            game = new Partida(creador, Estado.CREADA);

        } else {
            // EVITAR PARTIDA CONTRA SÍ MISMO
            if (game.getUsuarioId1() != null && game.getUsuarioId1().getId() == usuarioId) {

                game = new Partida(creador, Estado.CREADA);
                return pRepository.save(game);
            }

            // Unirse como usuario2 (acá ya sabemos que no es el mismo)
            game.setUsuario2(creador);
            game.setPartidaEstado(Estado.EN_CURSO);

            gameSManager.crearSesion(game);
            System.out.println("Partida guardada en sesion: " + game.getPartidaId());

            if (game.getUsuarioId1() != null) {
                try {
                    lobbyNotifier.notifyUser(game.getUsuarioId1().getId(), game.getPartidaId());
                } catch (Exception e) {
                    // no interrumpir el flujo principal si la notificación falla
                }
            }
        }

        return pRepository.save(game);
    }

    public GameSession cerrarPartida(int partidaId) {
        try {
            GameSession gs = gameSManager.obtenerSesion(partidaId);
            if (gs == null) {
                throw new RuntimeException("Sesion no encontrada");
            }
            gs.setUsuariosCerrados(gs.getUsuariosCerrados() + 1);

            if (gs.getUsuariosCerrados() == 2) {
                // Cerrar sesión en memoria
                System.out.println("Cerramos la sesion de la partida en memoria");
                gameSManager.cerrarSesion(partidaId);
            }
            return gs;

        } catch (IllegalStateException e) {
            return null;
        }
    }

    public GameSession iniciarPartida(int partidaId) {
        System.out.println("Intentando iniciar partida con ID: " + partidaId);
        Partida partida = pRepository.findById(partidaId).orElseThrow(() -> new RuntimeException("Partida not found"));

        try {
            String mapa = gameSManager.toString();
            System.out.println("GameSessionManager: " + mapa);
            GameSession gs = gameSManager.obtenerSesion(partidaId);
            if (gs == null) {
                throw new RuntimeException("Sesion no encontrada");
            }
            gs.setBandosDesplegados(gs.getBandosDesplegados() + 1);
            if (gs.getBandosDesplegados() == 2) {
                gs.setJugadorEnTurno(partida.getUsuarioId1().getId()); // El jugador 1 inicia la partida
                // Notificar por SSE a ambos usuarios que la partida comienza (despliegue
                // finalizado)
                try {
                    if (partida.getUsuarioId1() != null) {
                        lobbyNotifier.notifyUser(partida.getUsuarioId1().getId(), partida.getPartidaId());
                    }
                } catch (Exception e) {
                }
                try {
                    if (partida.getUsuarioId2() != null) {
                        lobbyNotifier.notifyUser(partida.getUsuarioId2().getId(), partida.getPartidaId());
                    }
                } catch (Exception e) {
                }
            }
            return gs;

        } catch (IllegalStateException e) {
            return null;
        }
    }

    // Ya confirmado los bandos tenemos toda la info necesario y cargamos todos los
    // valores de GameSession
    public GameSession asignarBandos(int partidaId, Bando b1, Bando b2) {
        Partida partida = pRepository.findById(partidaId).orElseThrow(
                () -> new RuntimeException("Partida no encontrada"));

        // seteamos los bandos recientemente recibidos por parametro en la eleccion del
        // usuario
        partida.setBando1(b1);
        partida.setBando2(b2);

        pRepository.save(partida);

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

            // Pasar el portadron aéreo primero y el naval segundo (aereo, naval)
            Portadron aereo = (b1 == Bando.AEREO) ? p1 : p2;
            Portadron naval = (b1 == Bando.NAVAL) ? p1 : p2;
            gs.setPortadrones(aereo, naval);

            List<Dron> drones = new ArrayList<>();

            // Crear 12 drones aéreos asociados al portadron aéreo
            for (int i = 0; i < 12; i++) {
                Dron d1 = new Dron(aereo, aereo.getTipo());
                dRepository.save(d1);
                drones.add(d1);
            }

            // Crear 6 drones navales asociados al portadron naval
            for (int i = 0; i < 6; i++) {
                Dron d2 = new Dron(naval, naval.getTipo());
                dRepository.save(d2);
                drones.add(d2);
            }

            gs.setDrones(drones);

            // Debugging: log created drones and association
            try {
                System.out.println("[PartidaService] Created drones count: " + drones.size());
                System.out.println(
                        "[PartidaService] Aereo porta id: " + aereo.getId() + ", Naval porta id: " + naval.getId());
            } catch (Exception e) {
            }

            // Notificar a ambos usuarios que la partida puede comenzar (despliegue listo)
            try {
                if (partida.getUsuarioId1() != null) {
                    lobbyNotifier.notifyUser(partida.getUsuarioId1().getId(), partida.getPartidaId());
                }
            } catch (Exception e) {
            }

            try {
                if (partida.getUsuarioId2() != null) {
                    lobbyNotifier.notifyUser(partida.getUsuarioId2().getId(), partida.getPartidaId());
                }
            } catch (Exception e) {
            }

            return gs;

        } catch (IllegalStateException e) {
            return null;
        }
    }

    public Partida obtenerPartida(int id) {
        return pRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Partida no encontrada"));
    }

    public boolean cambiarTurno(int partidaId, int usuarioId) {

        try {
            GameSession gs = gameSManager.obtenerSesion(partidaId);
            if (gs == null) {
                throw new RuntimeException("Sesion no encontrada");
            }

            gs.validarTurno(usuarioId); // valida que sea su turno
            gs.cambiarTurno(); // alterna internamente

            return true;

        } catch (IllegalStateException e) {
            return false;
        }
    }

    // Acciones dentro de la partida
    public void moverDron(int partidaId, int jugadorId, int dronId, int x, int y) {

        GameSession session = gameSManager.obtenerSesion(partidaId);
        session.moverDron(dronId, x, y, jugadorId);
        session.cambiarTurno();
        System.out.println("Va a avisar accion a jugador: " + session.getJugadorEnTurno());
        // Avisa a ambos jugadores, asi siempre tienen la info actualizada
        lobbyNotifier.notifyAccion(session.getJugador1Id(), partidaId);
        lobbyNotifier.notifyAccion(session.getJugador2Id(), partidaId);
    }

    public void moverPortadron(int partidaId, int jugadorId, int x, int y) {
        GameSession session = gameSManager.obtenerSesion(partidaId);
        session.moverPortadron(x, y, jugadorId);//
        session.cambiarTurno();
        lobbyNotifier.notifyAccion(session.getJugador1Id(), partidaId);
        lobbyNotifier.notifyAccion(session.getJugador2Id(), partidaId);
    }

    public void atacarDronOPorta(int partidaId, int jugadorId, int dronA, int obj) {
        GameSession session = gameSManager.obtenerSesion(partidaId);
        if (obj == 0) {
            session.atacarPortadron(dronA, jugadorId);
        } else {
            session.atacarDron(dronA, obj, jugadorId);
        }
        session.cambiarTurno();

        if (session.getGanadorId() > 0 && session.getEstado() == Estado.FINALIZADA) {
            ganarPartida(partidaId, session.getGanadorId());
        }

        lobbyNotifier.notifyAccion(session.getJugador1Id(), partidaId);
        lobbyNotifier.notifyAccion(session.getJugador2Id(), partidaId);
    }

    public void recargarDron(int partidaId, int jugadorId, int dronId) {
        GameSession session = gameSManager.obtenerSesion(partidaId);
        session.recargarDron(dronId, jugadorId);
        session.cambiarTurno();
        lobbyNotifier.notifyAccion(session.getJugador1Id(), partidaId);
        lobbyNotifier.notifyAccion(session.getJugador2Id(), partidaId);
    }

    public void desplegarDron(int partidaId, int jugadorId, int dronId, int x, int y) {
        GameSession session = gameSManager.obtenerSesion(partidaId);
        if (session == null) {
            throw new RuntimeException("Sesion no encontrada");
        }
        session.desplegarDron(dronId, x, y, jugadorId);
    }

    // ver si el del get tb va////
    public List<Partida> obtenerPartidasGuardadas(int usuarioId) {
        return pRepository.buscarPartidasGuardadas(usuarioId);
    }

    // ------------Abandono de partida -----------
    @Transactional
    public void renunciarPartida(int partidaId, int usuarioId) {
        Partida partida = pRepository.findById(partidaId).orElseThrow(
                () -> new RuntimeException("Partida no encontrada"));

        // Si ya está finalizada, no hacemos nada
        if (partida.getPartidaEstado() == Estado.FINALIZADA) {
            return;
        }

        Usuario u1 = partida.getUsuarioId1();
        Usuario u2 = partida.getUsuarioId2();

        // Validar que el usuario pertenezca a la partida y detectar ganador
        Usuario ganador = null;

        if (u1 != null && u1.getId() == usuarioId) {
            // Renunció u1 => gana u2 (si existe)
            ganador = u2;
        } else if (u2 != null && u2.getId() == usuarioId) {
            // Renunció u2 => gana u1
            ganador = u1;
        } else {
            throw new RuntimeException("El usuario no pertenece a la partida");
        }

        // Sumar victoria al ganador (si hay rival)
        if (ganador != null) {
            ganador.sumarVictoria();
            uRepository.save(ganador);
        }

        // Finalizar partida
        partida.setPartidaEstado(Estado.FINALIZADA);
        pRepository.save(partida);

        // Cerrar sesión en memoria
        gameSManager.cerrarSesion(partidaId);

        // Aviso a ambos jugadores que la partida ha finalizado al renunciar uno
        try {
            lobbyNotifier.notifyPartidaFinalizada(partida.getUsuarioId1().getId(), partidaId);
        } catch (Exception e) {
        }

        try {
            lobbyNotifier.notifyPartidaFinalizada(partida.getUsuarioId2().getId(), partidaId);
        } catch (Exception e) {
        }
    }

    // ------------Victoria de partida -----------
    @Transactional
    public void ganarPartida(int partidaId, int usuarioId) {
        Partida partida = pRepository.findById(partidaId).orElseThrow(
                () -> new RuntimeException("Partida no encontrada"));

        // Si ya está finalizada, no hacemos nada
        if (partida.getPartidaEstado() == Estado.FINALIZADA) {
            return;
        }

        Usuario u1 = partida.getUsuarioId1();
        Usuario u2 = partida.getUsuarioId2();

        // Validar que el usuario pertenezca a la partida y detectar ganador
        Usuario ganador = null;

        if (u1 != null && u1.getId() == usuarioId) {
            ganador = u1;
        } else if (u2 != null && u2.getId() == usuarioId) {
            ganador = u2;
        } else {
            throw new RuntimeException("El usuario no pertenece a la partida");
        }

        if (ganador != null) {
            ganador.sumarVictoria();
            uRepository.save(ganador);
        }

        // Finalizar partida
        partida.setPartidaEstado(Estado.FINALIZADA);
        pRepository.save(partida);

        // Aviso a ambos jugadores que la partida ha finalizado al ganar uno
        try {
            lobbyNotifier.notifyPartidaGanada(partida.getUsuarioId1().getId(), partidaId, ganador.getId());
        } catch (Exception e) {
        }

        try {
            lobbyNotifier.notifyPartidaGanada(partida.getUsuarioId2().getId(), partidaId, ganador.getId());
        } catch (Exception e) {
        }
    }

      // helper used internally to map a usuarioId -> portadron record
    private Portadron resolvePortadronForUsuario(int partidaId, int usuarioId) {
        Partida partida = pRepository.findById(partidaId).orElseThrow(() -> new RuntimeException("Partida no encontrada"));

        if (partida == null) {
            throw new RuntimeException("Partida no encontrada");
        }
        Integer u1 = partida.getUsuarioId1() != null ? partida.getUsuarioId1().getId() : null;
        Integer u2 = partida.getUsuarioId2() != null ? partida.getUsuarioId2().getId() : null;
        com.wardrones.warDrones.model.enums.Bando bando;
        if (u1 != null && u1 == usuarioId) {
            bando = partida.getBando1();
        } else if (u2 != null && u2 == usuarioId) {
            bando = partida.getBando2();
        } else {
            throw new RuntimeException("El usuario no pertenece a la partida");
        }
        return pdRepository.findByPartidaIdAndTipo(partida.getPartidaId(), bando)
                .orElseThrow(() -> new RuntimeException("Portadron no encontrado para el usuario"));
    }

    @Transactional
    public void guardarPartida(int partidaId) {
        Partida partida = pRepository.findById(partidaId).orElseThrow(
                () -> new RuntimeException("Partida no encontrada")
        );

        partida.setPartidaEstado(Estado.GUARDADA);
        pRepository.save(partida);

        GameSession session = gameSManager.obtenerSesion(partidaId);
        if (session != null) {
            // Actualizar portadrones
            PortadronState nav = session.getPortadronNaval();
            PortadronState aer = session.getPortadronAereo();

            if (nav != null) {
                pdRepository.findById(nav.getId()).ifPresent(p -> {
                    p.setPosicionX(nav.getPosicionX());
                    p.setPosicionY(nav.getPosicionY());
                    p.setVida(nav.getVida());
                    p.setEstado(nav.getEstado());
                    pdRepository.save(p);
                });
            }
            if (aer != null) {
                pdRepository.findById(aer.getId()).ifPresent(p -> {
                    p.setPosicionX(aer.getPosicionX());
                    p.setPosicionY(aer.getPosicionY());
                    p.setVida(aer.getVida());
                    p.setEstado(aer.getEstado());
                    pdRepository.save(p);
                });
            }

            // Actualizar drones
            Map<Integer, DronState> dronesMap = session.getDrones();
            if (dronesMap != null) {
                for (DronState ds : dronesMap.values()) {
                    dRepository.findById(ds.getId()).ifPresent(d -> {
                        d.setPosicionX(ds.getPosicionX());
                        d.setPosicionY(ds.getPosicionY());
                        d.setVida(ds.getVida());
                        d.setEstado(ds.getEstado());
                        d.setMunicion(ds.getMunicion());
                        d.setRecargas(ds.getRecargas());
                        dRepository.save(d);
                    });
                }
            }
        }

        // Sacar ambos al menu principal al guardar la partida
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

    public void guardarDiscovered(int partidaId, int usuarioId, String nieblaDescubierta) {
        Portadron porta = resolvePortadronForUsuario(partidaId, usuarioId);
        System.out.println("[PartidaService] resolved portadron id=" + porta.getId() + " tipo=" + porta.getTipo() );
        porta.setDiscovered(nieblaDescubierta);
        pdRepository.save(porta);
    }

    public List<Partida> obtenerPartidasReanudables(int usuarioId) {
        return pRepository.buscarPartidasReanudables(usuarioId);
    }

    public String obtenerNieblaDescubierta(int partidaId, int usuarioId) {

        Portadron porta = resolvePortadronForUsuario(partidaId, usuarioId);
        return porta.getDiscovered();
    }

    @Transactional
    public void marcarReanudando(int partidaId) {
        Partida partida = pRepository.findById(partidaId)
                .orElseThrow(() -> new RuntimeException("Partida no encontrada."));
        partida.setPartidaEstado(Estado.REANUDANDO);
        pRepository.save(partida);
    }

    @Transactional
    public void unirseReanudando(int partidaId, int usuarioId) {
        Partida partida = pRepository.findById(partidaId)
                .orElseThrow(() -> new RuntimeException("Partida no encontrada."));

        partida.setPartidaEstado(Estado.EN_CURSO);
        pRepository.save(partida);

        gameSManager.recuperarSesion(partida);
        GameSession gs = gameSManager.obtenerSesion(partidaId);


        Portadron pNaval = pdRepository.findByPartidaIdAndTipo(partidaId, Bando.NAVAL).orElseThrow(() -> new RuntimeException("Portadron no encontrado"));
        Portadron pAereo = pdRepository.findByPartidaIdAndTipo(partidaId, Bando.AEREO).orElseThrow(() -> new RuntimeException("Portadron no encontrado"));
        
        gs.setPortadrones(pAereo, pNaval);
        List<Dron> dronsN = dRepository.findByDronPortaDronId_Id(pNaval.getId());
        List<Dron> dronsA = dRepository.findByDronPortaDronId_Id(pAereo.getId());

        List<Dron> allDrons = new ArrayList<>();

        allDrons.addAll(dronsN);
        allDrons.addAll(dronsA);

        gs.setDrones(allDrons);


        try {
            lobbyNotifier.notifyUser(partida.getUsuarioId1().getId(), partidaId);
        } catch (Exception e) {
        }

        try {
            lobbyNotifier.notifyUser(partida.getUsuarioId2().getId(), partidaId);
        } catch (Exception e) {
        }

    }

    public ObtenerPartidaInfoResponse obtenerPartidaInfo(int partidaId) {
        GameSession gs = gameSManager.obtenerSesion(partidaId);

        if (gs == null) {
            throw new RuntimeException("Sesión de partida no encontrada");
        }

        int usuario1Id = gs.getJugador1Id();
        int usuario2Id = gs.getJugador2Id();

        String bando1 = gs.getJugador1Bando() != null ? gs.getJugador1Bando().name() : null;
        String bando2 = gs.getJugador2Bando() != null ? gs.getJugador2Bando().name() : null;

        boolean bandosAsignados = bando1 != null && bando2 != null;
        int bandosDesplegados = gs.getBandosDesplegados();
        Integer turnoActual = gs.getTurnoActual() > 0 ? gs.getTurnoActual() : null;

        PortadronState portaNaval = gs.getPortadronNaval();
        PortadronState portaAereo = gs.getPortadronAereo();

        List<ObtenerPartidaInfoResponse.PortadronInfo> portadrones = new ArrayList<>();
        if (portaNaval != null) {
            portadrones.add(new ObtenerPartidaInfoResponse.PortadronInfo(
                    portaNaval.getId(),
                    portaNaval.getTipoDePortadron().name(),
                    portaNaval.getPosicionX(),
                    portaNaval.getPosicionY(),
                    portaNaval.getVida(),
                    portaNaval.getEstado()));
        }
        if (portaAereo != null) {
            portadrones.add(new ObtenerPartidaInfoResponse.PortadronInfo(
                    portaAereo.getId(),
                    portaAereo.getTipoDePortadron().name(),
                    portaAereo.getPosicionX(),
                    portaAereo.getPosicionY(),
                    portaAereo.getVida(),
                    portaAereo.getEstado()));
        }

        Map<Integer, DronState> dronesStateMap = gs.getDrones();
        List<DronState> dronesState = new ArrayList<>();
        if (dronesStateMap != null) {
            dronesState.addAll(dronesStateMap.values());
        }
        dronesState.sort(Comparator.comparingInt(DronState::getId));

        List<ObtenerPartidaInfoResponse.DronInfo> drones = new ArrayList<>();
        for (DronState dron : dronesState) {
            String bando = null;
            // Primero, intentar por listado de ids (cuando está poblado)
            if (portaNaval != null && portaNaval.getListadoDronesIds() != null
                    && portaNaval.getListadoDronesIds().contains(dron.getId())) {
                bando = "NAVAL";
            } else if (portaAereo != null && portaAereo.getListadoDronesIds() != null
                    && portaAereo.getListadoDronesIds().contains(dron.getId())) {
                bando = "AEREO";
            } else {
                // Fallback: usar el portadronId del dron y compararlo con los ids de los
                // portadrones
                try {
                    if (portaNaval != null && dron.getPortadronId() == portaNaval.getId()) {
                        bando = "NAVAL";
                    } else if (portaAereo != null && dron.getPortadronId() == portaAereo.getId()) {
                        bando = "AEREO";
                    }
                } catch (Exception e) {
                    // no-op
                }
            }

            drones.add(new ObtenerPartidaInfoResponse.DronInfo(
                    dron.getId(),
                    dron.getPortadronId(),
                    bando,
                    dron.getPosicionX(),
                    dron.getPosicionY(),
                    dron.getVida(),
                    dron.getMunicion(),
                    dron.getRecargas(),
                    dron.getEstado()));
        }

        boolean fin = (gs.getEstado() == Estado.FINALIZADA);
        boolean esN = gs.getEsNueva();

        return new ObtenerPartidaInfoResponse(
                partidaId,
                usuario1Id,
                usuario2Id,
                bando1,
                bando2,
                bandosAsignados,
                bandosDesplegados,
                turnoActual,
                fin,
                gs.getGanadorId(),
                esN,
                drones,
                portadrones);
    }

    @Transactional
    public void cancelarPartida(int partidaId, int usuarioId) {
        Partida partida = pRepository.findById(partidaId)
                .orElseThrow(() -> new RuntimeException("Partida no encontrada"));

        if (partida.getUsuarioId1() == null || partida.getUsuarioId1().getId() != usuarioId) {
            throw new RuntimeException("Solo el creador puede cancelar la partida");
        }
        if (partida.getUsuarioId2() != null) {
            throw new RuntimeException("No se puede cancelar: ya tiene rival");
        }
        if (partida.getPartidaEstado() != Estado.CREADA) {
            throw new RuntimeException("No se puede cancelar: no está en estado CREADA");
        }

        try {
            gameSManager.cerrarSesion(partidaId);
        } catch (Exception ignored) {
        }

        // borrar hijos primero
        dRepository.deleteByPartidaId(partidaId);
        pdRepository.deleteByPartidaId(partidaId);

        // borrar la partida
        pRepository.deleteById(partidaId);

        // forzar ejecución ya
        pRepository.flush();
    }

    @Transactional
    public void cancelarReanudacion(int partidaId, int usuarioId) {
        Partida partida = pRepository.findById(partidaId)
                .orElseThrow(() -> new RuntimeException("Partida no encontrada."));

        // siempre el que va al lobby es el usuario 1
        if (partida.getUsuarioId1() == null || partida.getUsuarioId1().getId() != usuarioId) {
            throw new RuntimeException("Solo el jugador 1 puede cancelar la reanudación.");
        }

        // si no está en REANUDANDO, no tiene sentido
        if (partida.getPartidaEstado() != Estado.REANUDANDO) {
            return;
        }

        partida.setPartidaEstado(Estado.GUARDADA);
        pRepository.save(partida);
    }

    @Transactional
    public void eliminarPartidaGuardada(int partidaId, int usuarioId) {
        Partida partida = pRepository.findById(partidaId)
                .orElseThrow(() -> new RuntimeException("Partida no encontrada"));

        // permitir borrar si el usuario es parte de la partida (u1 o u2)
        boolean esU1 = partida.getUsuarioId1() != null && partida.getUsuarioId1().getId() == usuarioId;
        boolean esU2 = partida.getUsuarioId2() != null && partida.getUsuarioId2().getId() == usuarioId;

        if (!esU1 && !esU2) {
            throw new RuntimeException("El usuario no pertenece a la partida");
        }

        // solo borrar partidas guardadas (evitamos borrar una que esté reanudándose/en
        // curso)
        if (partida.getPartidaEstado() != Estado.GUARDADA) {
            throw new RuntimeException("Solo se pueden eliminar partidas en estado GUARDADA");
        }

        // cerrar sesión si existiera (normalmente en guardada no debería, pero por
        // seguridad)
        try {
            gameSManager.cerrarSesion(partidaId);
        } catch (Exception ignored) {
        }

        // borrar hijos primero
        dRepository.deleteByPartidaId(partidaId);
        pdRepository.deleteByPartidaId(partidaId);

        // borrar la partida
        pRepository.deleteById(partidaId);

        // forzar ejecución ya
        pRepository.flush();
    }

    
}
