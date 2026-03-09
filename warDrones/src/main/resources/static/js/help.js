(function () {
    function ensureUI() {
        // Botón ?
        let btn = document.getElementById("helpBtn");
        if (!btn) {
            btn = document.createElement("button");
            btn.id = "helpBtn";
            btn.className = "boton btn-help font-display";
            btn.type = "button";
            btn.textContent = "?";
            btn.setAttribute("aria-label", "Ayuda");
            btn.setAttribute("aria-expanded", "false");
            document.body.appendChild(btn);
        } else {
            btn.setAttribute("aria-label", "Ayuda");
            btn.setAttribute("aria-expanded", "false");
        }

        // Overlay
        let overlay = document.getElementById("helpOverlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.id = "helpOverlay";
            overlay.className = "help-overlay";
            document.body.appendChild(overlay);
        }

        // Panel
        let panel = document.getElementById("helpPanel");
        if (!panel) {
            panel = document.createElement("div");
            panel.id = "helpPanel";
            panel.className = "modal-content help-panel font-display";
            panel.innerHTML = `
                <h2 id="helpTitle">Ayuda</h2>
                <div id="helpBody" class="help-body"></div>
                <div class="help-footer">
                    <button id="helpOk" class="boton btn-ok font-display" type="button">OK</button>
                </div>
            `;
            document.body.appendChild(panel);
        }
    }

    function setContent(title, items) {
        const t = document.getElementById("helpTitle");
        const body = document.getElementById("helpBody");

        if (t) t.textContent = title || "Ayuda";
        if (!body) return;

        body.innerHTML = "";
        const ul = document.createElement("ul");
        (items || []).forEach((txt) => {
            const li = document.createElement("li");
            li.textContent = txt;
            ul.appendChild(li);
        });
        body.appendChild(ul);
    }

    function openHelp() {
        document.getElementById("helpOverlay")?.classList.add("open");
        document.getElementById("helpPanel")?.classList.add("open");
        document.getElementById("helpBtn")?.setAttribute("aria-expanded", "true");
    }

    function closeHelp() {
        document.getElementById("helpOverlay")?.classList.remove("open");
        document.getElementById("helpPanel")?.classList.remove("open");
        document.getElementById("helpBtn")?.setAttribute("aria-expanded", "false");
    }

    function toggleHelp() {
        const panel = document.getElementById("helpPanel");
        if (!panel) return;
        if (panel.classList.contains("open")) closeHelp();
        else openHelp();
    }

    window.Help = {
        init: function ({ title, items }) {
            ensureUI();
            setContent(title, items);

            const btn = document.getElementById("helpBtn");
            const overlay = document.getElementById("helpOverlay");
            const ok = document.getElementById("helpOk");

            if (btn) btn.onclick = toggleHelp;
            if (overlay) overlay.onclick = closeHelp;
            if (ok) ok.onclick = closeHelp;

            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape") closeHelp();
            });

            closeHelp();
        },
    };
})();