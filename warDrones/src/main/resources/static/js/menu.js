        // Obtener el nombre de usuario del almacenamiento local
        const nombreUsuario = localStorage.getItem("username");

        // Mostrar el nombre de usuario en la página
        if (nombreUsuario) {
            document.getElementById("nombreUsuario").textContent = nombreUsuario;
        }