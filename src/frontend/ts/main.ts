class Main implements EventListenerObject {
    private nombre: string = "matias";
    private users: Array<Usuario> = new Array();
    private editModal: any;

    constructor() {
        this.users.push(new Usuario('mramos', '123132'));
        
        let btn = this.recuperarElemento("btn");
        btn.addEventListener('click', this);
        let btnBuscar = this.recuperarElemento("btnBuscar");
        btnBuscar.addEventListener('click', this);
        let btnLogin = this.recuperarElemento("btnLogin");
        btnLogin.addEventListener('click', this);
        let btnPost = this.recuperarElemento("btnPost");
        btnPost.addEventListener('click', this);
        
        // Inicializar el modal de edición
        const modals = document.querySelectorAll('.modal');
        this.editModal = M.Modal.init(modals);
    }

    handleEvent(object: Event): void {
        let idDelElemento = (<HTMLElement>object.target).id;
        if (idDelElemento == 'btn') {
            let divLogin = this.recuperarElemento("divLogin");
            divLogin.hidden = false;
        } else if (idDelElemento === 'btnBuscar') {
            console.log("Buscando!");
            this.buscarDevices();
        } else if (idDelElemento === 'btnLogin') {
            this.login(object);
        } else if (idDelElemento === 'btnPost') {
            this.ejecutarPost();
        } else if (idDelElemento.startsWith('edit_')) {
            this.abrirModalEdicion(object);
        } else if (idDelElemento.startsWith('slider_')) {
            this.cambiarIntensidad(object);
        } else {
            this.prenderOApagar(object);
        }
    }

    private buscarDevices(): void {
        let xmlHttp = new XMLHttpRequest();

        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4) {
                if (xmlHttp.status == 200) {
                    let ul = this.recuperarElemento("list");
                    let listaDevices: string = '';
                    let lista: Array<Device> = JSON.parse(xmlHttp.responseText);
                    
                    for (let item of lista) {
                        listaDevices += `
                        <li class="collection-item avatar">
                            <img src="./static/images/lightbulb.png" alt="" class="circle">
                            <span class="title">${item.name}</span>
                            <p>${item.description}</p>
                            <a href="#!" class="secondary-content">
                                <div class="switch">
                                    <label>
                                        Off`;
                        if (item.state) {
                            listaDevices += `<input idBd="${item.id}" id="cb_${item.id}" type="checkbox" checked>`;
                        } else {
                            listaDevices += `<input idBd="${item.id}" id="cb_${item.id}" type="checkbox">`;
                        }
                        listaDevices += `      
                                        <span class="lever"></span>
                                        On
                                    </label>
                                </div>
                            </a>
                            <button id="edit_${item.id}" class="btn-small waves-effect waves-light">Editar</button>
                            <div class="range-field">
                                <input id="slider_${item.id}" type="range" min="0" max="1" step="0.1" value="${item.intensity || 0}">
                            </div>
                        </li>`;
                    }

                    ul.innerHTML = listaDevices;

                    for (let item of lista) {
                        let cb = this.recuperarElemento("cb_" + item.id);
                        cb.addEventListener("click", this);

                        let editBtn = this.recuperarElemento("edit_" + item.id);
                        editBtn.addEventListener("click", this);

                        let slider = this.recuperarElemento("slider_" + item.id);
                        slider.addEventListener("change", this);
                    }
                } else {
                    alert("ERROR en la consulta");
                }
            }
        };

        xmlHttp.open("GET", "http://localhost:8000/devices", true);
        xmlHttp.send();
    }

    private abrirModalEdicion(object: Event): void {
        const deviceId = (<HTMLButtonElement>object.target).id.split('_')[1];
        // Abrir el modal y rellenar con la información actual del dispositivo
        this.recuperarElemento("editName").value = "";
        this.recuperarElemento("editDescription").value = "";
        this.recuperarElemento("editType").value = ""; 
        
        // Mostrar modal
        this.editModal[0].open();
        
        // Guardar cambios
        let btnSaveEdit = this.recuperarElemento("btnSaveEdit");
        btnSaveEdit.onclick = () => {
            const updatedDevice = {
                name: this.recuperarElemento("editName").value,
                description: this.recuperarElemento("editDescription").value,
                type: this.recuperarElemento("editType").value,
                id: deviceId
            };
            this.actualizarDevice(updatedDevice);
        };
    }

    private actualizarDevice(device: any): void {
        let xmlHttpPost = new XMLHttpRequest();
        xmlHttpPost.open("PUT", `http://localhost:8000/device/${device.id}`, true);
        xmlHttpPost.setRequestHeader("Content-Type", "application/json");
        xmlHttpPost.send(JSON.stringify(device));

        xmlHttpPost.onreadystatechange = () => {
            if (xmlHttpPost.readyState === 4 && xmlHttpPost.status === 200) {
                alert("Dispositivo actualizado correctamente");
                this.editModal[0].close();
                this.buscarDevices();
            }
        };
    }

    private cambiarIntensidad(object: Event): void {
        const deviceId = (<HTMLInputElement>object.target).id.split('_')[1];
        const intensityValue = (<HTMLInputElement>object.target).value;

        let xmlHttpPost = new XMLHttpRequest();
        xmlHttpPost.open("POST", `http://localhost:8000/device/${deviceId}/intensity`, true);
        xmlHttpPost.setRequestHeader("Content-Type", "application/json");
        xmlHttpPost.send(JSON.stringify({ intensity: intensityValue }));

        xmlHttpPost.onreadystatechange = () => {
            if (xmlHttpPost.readyState === 4 && xmlHttpPost.status === 200) {
                console.log("Intensidad actualizada");
            }
        };
    }

    private prenderOApagar(object: Event): void {
        let input = <HTMLInputElement>object.target;
        let prenderJson = { id: input.getAttribute("idBd"), status: input.checked };
        
        let xmlHttpPost = new XMLHttpRequest();
        xmlHttpPost.open("POST", "http://localhost:8000/device", true);
        xmlHttpPost.setRequestHeader("Content-Type", "application/json");
        xmlHttpPost.send(JSON.stringify(prenderJson));

        xmlHttpPost.onreadystatechange = () => {
            if (xmlHttpPost.readyState === 4 && xmlHttpPost.status === 200) {
                let json = JSON.parse(xmlHttpPost.responseText);
                alert(json.id);
            }
        };
    }

    private recuperarElemento(id: string): HTMLInputElement {
        return <HTMLInputElement>document.getElementById(id);
    }

    private ejecutarPost() {
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", "http://localhost:8000/usuario", true);
        xmlHttp.setRequestHeader("Content-Type", "application/json");
        xmlHttp.send(JSON.stringify({ name: 'mramos' }));

        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                console.log("se ejecutó el post", xmlHttp.responseText);
            }
        };
    }

    private login(object: Event): void {
        let iUser = this.recuperarElemento("userName");
        let iPass = this.recuperarElemento("userPass");
        let usuarioNombre: string = iUser.value;
        let usuarioPassword: string = iPass.value;
        
        if (usuarioNombre.length >= 4 && usuarioPassword.length >= 6) {
            let usuario: Usuario = new Usuario(usuarioNombre, usuarioPassword);
            let checkbox = this.recuperarElemento("cbRecor");
            
            console.log(usuario, checkbox.checked);
            iUser.disabled = true;
            (<HTMLInputElement>object.target).disabled = true;
            let divLogin = this.recuperarElemento("divLogin");
            divLogin.hidden = true;
        } else {
            alert("El usuario o la contraseña son incorrectos");
        }
    }
}


window.addEventListener('load', () => 
{
    let main: Main = new Main();

});

