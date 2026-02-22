            const form = document.getElementById("loginForm");
            const input = document.getElementById("username");

            form.addEventListener("submit", async (e) => {
                e.preventDefault();

                const username = input.value.trim();
                if (!username) {
                    input.setCustomValidity("Debes ingresar un usuario.");
                    input.reportValidity();
                    return;
                }

                input.setCustomValidity(""); // resetear mensaje de error

                // 1) intentamos login
                let res = await fetch("/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username })
                });

                // 2) si no existe, lo registramos
                if (!res.ok) {
                    res = await fetch("/registrar", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username })
                    });
                }

                if (!res.ok) {
                    const msg = await res.text();
                    alert("Error: " + msg);
                    return;
                }

                const user = await res.json();
                localStorage.setItem("userId", user.id ?? user.usuarioId ?? "");
                localStorage.setItem("username", user.nombre ?? user.usuarioNombre ?? username);

                window.location.href = "sections/menu.html";
            });