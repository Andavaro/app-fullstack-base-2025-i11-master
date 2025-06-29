class Main {
    constructor() {
        this.users = [new Usuario('admin', 'admin')];
        this.editModal = M.Modal.init(document.querySelectorAll('.modal'))[0];

        this.bindEvents();
        this.mostrarLogin();
    }

    bindEvents() {
        this.$("btnLogin").addEventListener("click", (e) => this.login(e));
        this.$("btnBuscar").addEventListener("click", () => this.buscarDevices());
        this.$("btn").addEventListener("click", () => this.mostrarLogin());
        this.$("btnPost").addEventListener("click", () => this.ejecutarPost());
        this.$("btnSaveEdit").addEventListener("click", () => this.guardarCambiosModal());
    }

    mostrarLogin() {
        this.$("divLogin").hidden = false;
        this.$("btn").hidden = true;
        this.$("btnBuscar").hidden = true;
        this.$("btnPost").hidden = true;
    }

    login() {
        const usuario = this.$("userName").value;
        const clave = this.$("userPass").value;

        const valido = this.users.some(u => u.userName === usuario && u.password === clave);

        if (valido) {
            this.$("divLogin").hidden = true;
            this.$("btnBuscar").hidden = false;
            this.$("btn").hidden = false;
            this.$("btnPost").hidden = false;
        } else {
            alert("Credenciales incorrectas");
        }
    }

    buscarDevices() {
        fetch("/devices")
            .then(res => res.json())
            .then(data => {
                let html = "";
                for (const d of data) {
                    html += `
                        <li class="collection-item avatar">
                            <img src="./static/images/lightbulb.png" alt="" class="circle">
                            <span class="title">${d.name}</span>
                            <p>${d.description}</p>
                            <a href="#!" class="secondary-content">
                                <div class="switch">
                                    <label>
                                        Off
                                        <input id="cb_${d.id}" type="checkbox" ${d.state ? "checked" : ""}>
                                        <span class="lever"></span>
                                        On
                                    </label>
                                </div>
                            </a>
                            <button id="edit_${d.id}" class="btn-small">Editar</button>
                            <div class="range-field">
                                <input id="slider_${d.id}" type="range" min="0" max="1" step="0.1" value="${d.intensity || 0}">
                            </div>
                        </li>
                    `;
                }
                this.$("list").innerHTML = html;

                for (const d of data) {
                    this.$(`cb_${d.id}`).addEventListener("change", (e) => this.cambiarEstado(d.id, e.target.checked));
                    this.$(`slider_${d.id}`).addEventListener("change", (e) => this.cambiarIntensidad(d.id, e.target.value));
                    this.$(`edit_${d.id}`).addEventListener("click", () => this.abrirModal(d));
                }
            })
            .catch(err => alert("Error al obtener dispositivos"));
    }

    cambiarEstado(id, estado) {
        fetch("/device", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id, status: estado })
        })
        .then(res => res.json())
        .then(() => console.log("Estado actualizado"))
        .catch(() => alert("Error actualizando estado"));
    }

    cambiarIntensidad(id, intensidad) {
        fetch(`/device/${id}/intensity`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ intensity: intensidad })
        })
        .then(() => console.log("Intensidad actualizada"))
        .catch(() => alert("Error actualizando intensidad"));
    }

    abrirModal(device) {
        this.$("editName").value = device.name;
        this.$("editDescription").value = device.description;
        this.$("editType").value = device.type;
        this.deviceEditandoId = device.id;
        M.updateTextFields();
        this.editModal.open();
    }

    guardarCambiosModal() {
        const datos = {
            name: this.$("editName").value,
            description: this.$("editDescription").value,
            type: this.$("editType").value
        };

        fetch(`/device/${this.deviceEditandoId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        })
        .then(res => {
            if (res.ok) {
                this.editModal.close();
                this.buscarDevices();
            } else {
                throw new Error("Error actualizando");
            }
        })
        .catch(() => alert("Error al actualizar dispositivo"));
    }

    ejecutarPost() {
        fetch("/usuario", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: 999, name: "test" })
        })
        .then(() => alert("POST ejecutado"))
        .catch(() => alert("Error en POST"));
    }

    $(id) {
        return document.getElementById(id);
    }
}

window.addEventListener("DOMContentLoaded", () => new Main());
