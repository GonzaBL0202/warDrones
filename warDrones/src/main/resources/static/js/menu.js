// Obtener el nombre de usuario del almacenamiento local
const nombreUsuario = localStorage.getItem("username");

// Mostrar el nombre de usuario en la página
if (nombreUsuario) {
    document.getElementById("nombreUsuario").textContent = nombreUsuario;
}

Help.init({
    title: "Ayuda - Menú",
    items: [
        "Inicia una nueva partida.",
        "Carga una partida guardada.",
        "Revisa en que puesto del ranking estás."
    ]
});