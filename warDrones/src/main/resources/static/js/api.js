const API_URL = "http://localhost:8080";

async function postJson(path, payload) {
    const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    return res;
}

async function put(path) {
    const res = await fetch(`${API_URL}${path}`, { method: 'PUT' });
    return res;
}

async function putJson(path, payload) {
    const res = await fetch(`${API_URL}${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    return res;
}

window.PartidaApi = {
    partidaInfo: (partidaId) => fetch(`${API_URL}/obtenerPartidaInfo/${partidaId}`),
    asignarBandos: (payload) => postJson('/asignarBandos', payload),
    iniciarPartida: (partidaId) => postJson(`/iniciarPartida/${partidaId}`, {}),
    moverDron: (payload) => postJson('/moverDron', payload),
    desplegarDron: (payload) => postJson('/desplegarDron', payload),
    moverPortadron: (payload) => postJson('/moverPortadron', payload),
    atacarDronOPorta: (payload) => postJson('/atacarDronOPorta', payload),
    recargarDron: (payload) => postJson('/recargarDron', payload),
    renunciarPartida: (partidaId, usuarioId) => put(`/partida/renunciar/${partidaId}?usuarioId=${encodeURIComponent(usuarioId)}`),
    guardarPartida: (partidaId) => putJson(`/partida/guardar/${partidaId}`),
    lobbyEventSource: (usuarioId) => new EventSource(`${API_URL}/lobby/connect?usuarioId=${encodeURIComponent(usuarioId)}`),
    obtenerFog: (partidaId, usuarioId) => fetch(`${API_URL}/partida/fog/${partidaId}?usuarioId=${encodeURIComponent(usuarioId)}`),
    cerrarPartida: (partidaId) => postJson(`/cerrarPartida/${partidaId}`),
    guardarDiscovered: (partidaId, usuarioId, discovered) => putJson(`/partida/guardarDiscovered/${partidaId}?usuarioId=${encodeURIComponent(usuarioId)}`, { discovered }),
};