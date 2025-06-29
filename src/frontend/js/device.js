class Device {
}
let isLogged = false;
let currentDeviceId = 0;
// Función para crear elementos de la lista con slider y botón de editar
function renderDeviceList(devices) {
    const list = document.getElementById("list");
    list.innerHTML = "";
    devices.forEach(device => {
        const li = document.createElement("li");
        li.className = "collection-item";
        li.innerHTML = `
      <strong>${device.name}</strong><br>
      ${device.description}<br>
      Intensidad:
      <input type="range" id="slider-${device.id}" min="0" max="1" step="0.01" value="${device.intensity}" />
      <button data-id="${device.id}" class="btn-small edit-btn">Editar</button>
    `;
        list.appendChild(li);
    });
    // Agregar listeners a sliders
    devices.forEach(device => {
        const slider = document.getElementById(`slider-${device.id}`);
        slider === null || slider === void 0 ? void 0 : slider.addEventListener("input", () => {
            fetch(`/device/${device.id}/intensity`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ intensity: slider.value })
            });
        });
    });
    // Listeners a botones de editar
    document.querySelectorAll(".edit-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            var _a;
            currentDeviceId = parseInt(e.target.dataset.id);
            const device = devices.find(d => d.id === currentDeviceId);
            if (!device)
                return;
            document.getElementById("editName").value = device.name;
            document.getElementById("editDescription").value = device.description;
            document.getElementById("editType").value = String(device.type);
            M.updateTextFields();
            const modalElem = document.getElementById("editModal");
            (_a = M.Modal.getInstance(modalElem)) === null || _a === void 0 ? void 0 : _a.open();
        });
    });
}
// Guardar cambios del modal
function saveEditChanges() {
    const name = document.getElementById("editName").value;
    const description = document.getElementById("editDescription").value;
    const type = parseInt(document.getElementById("editType").value);
    fetch(`/device/${currentDeviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, type })
    }).then(res => {
        var _a;
        if (res.ok) {
            (_a = M.Modal.getInstance(document.getElementById("editModal"))) === null || _a === void 0 ? void 0 : _a.close();
            loadDevices();
        }
        else {
            alert("Error al actualizar dispositivo");
        }
    });
}
// Cargar dispositivos
function loadDevices() {
    fetch("/devices")
        .then(res => res.json())
        .then(data => {
        renderDeviceList(data);
    });
}
// Validar login
function setupLogin() {
    const loginBtn = document.getElementById("btnLogin");
    loginBtn === null || loginBtn === void 0 ? void 0 : loginBtn.addEventListener("click", () => {
        const user = document.getElementById("userName").value;
        const pass = document.getElementById("userPass").value;
        if (user === "admin" && pass === "1234") {
            isLogged = true;
            document.getElementById("divLogin").setAttribute("hidden", "true");
            loadDevices();
        }
        else {
            alert("Credenciales incorrectas");
        }
    });
}
document.addEventListener("DOMContentLoaded", () => {
    var _a, _b;
    setupLogin();
    (_a = document.getElementById("btnSaveEdit")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", saveEditChanges);
    (_b = document.getElementById("btn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
        var _a;
        (_a = document.getElementById("divLogin")) === null || _a === void 0 ? void 0 : _a.removeAttribute("hidden");
    });
});
