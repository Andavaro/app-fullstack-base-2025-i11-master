class Device {
  public id: number;
  public name: string;
  public description: string;
  public state: boolean;
  public type: number;
  public intensity: number;
}

let isLogged = false;
let currentDeviceId: number = 0;

// Función para crear elementos de la lista con slider y botón de editar
function renderDeviceList(devices: Device[]) {
  const list = document.getElementById("list") as HTMLUListElement;
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
    const slider = document.getElementById(`slider-${device.id}`) as HTMLInputElement;
    slider?.addEventListener("input", () => {
      fetch(`/device/${device.id}/intensity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intensity: slider.value })
      });
    });
  });

  // Listeners a botones de editar
  document.querySelectorAll(".edit-btn").forEach(button => {
    button.addEventListener("click", (e: any) => {
      currentDeviceId = parseInt(e.target.dataset.id);
      const device = devices.find(d => d.id === currentDeviceId);
      if (!device) return;
      (document.getElementById("editName") as HTMLInputElement).value = device.name;
      (document.getElementById("editDescription") as HTMLInputElement).value = device.description;
      (document.getElementById("editType") as HTMLInputElement).value = String(device.type);
      M.updateTextFields();
      const modalElem = document.getElementById("editModal");
      M.Modal.getInstance(modalElem!)?.open();
    });
  });
}

// Guardar cambios del modal
function saveEditChanges() {
  const name = (document.getElementById("editName") as HTMLInputElement).value;
  const description = (document.getElementById("editDescription") as HTMLInputElement).value;
  const type = parseInt((document.getElementById("editType") as HTMLInputElement).value);

  fetch(`/device/${currentDeviceId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, type })
  }).then(res => {
    if (res.ok) {
      M.Modal.getInstance(document.getElementById("editModal")!)?.close();
      loadDevices();
    } else {
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
  loginBtn?.addEventListener("click", () => {
    const user = (document.getElementById("userName") as HTMLInputElement).value;
    const pass = (document.getElementById("userPass") as HTMLInputElement).value;
    if (user === "admin" && pass === "1234") {
      isLogged = true;
      document.getElementById("divLogin")!.setAttribute("hidden", "true");
      loadDevices();
    } else {
      alert("Credenciales incorrectas");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupLogin();
  document.getElementById("btnSaveEdit")?.addEventListener("click", saveEditChanges);
  document.getElementById("btn")?.addEventListener("click", () => {
    document.getElementById("divLogin")?.removeAttribute("hidden");
  });
});