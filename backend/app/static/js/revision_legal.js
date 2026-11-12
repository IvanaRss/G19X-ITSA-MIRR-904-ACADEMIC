
const tablaRevision = document.getElementById("tablaRevision");
const buscarRevision = document.getElementById("buscarRevision");
const filtroRevision = document.getElementById("filtroRevision");

const modal = document.getElementById("modalRevision");
const detalleDocumento = document.getElementById("detalleDocumento");
const observaciones = document.getElementById("observaciones");
const mensajeRevision = document.getElementById("mensajeRevision");

let solicitudes = [];
let solicitudSeleccionada = null;

async function cargarSolicitudes() {
    try {
        const respuesta = await fetch("/solicitudes");

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar las solicitudes.");
        }

        solicitudes = await respuesta.json();

        actualizarContadores();
        mostrarSolicitudes();

    } catch (error) {
        console.error(error);

        tablaRevision.innerHTML = `
            <tr>
                <td colspan="7">Error al cargar las solicitudes.</td>
            </tr>
        `;
    }
}

function actualizarContadores() {
    document.getElementById("totalRevision").textContent =
        solicitudes.filter(s => ["pendiente", "en_revision"].includes(s.estado)).length;

    document.getElementById("pendientesRevision").textContent =
        solicitudes.filter(s => s.estado === "pendiente").length;

    document.getElementById("aprobadasRevision").textContent =
        solicitudes.filter(s => s.estado === "aprobada").length;

    document.getElementById("rechazadasRevision").textContent =
        solicitudes.filter(s => s.estado === "rechazada").length;
}

function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caracter]);
}

function mostrarSolicitudes() {
    const texto = buscarRevision.value.toLowerCase().trim();
    const estado = filtroRevision.value;

    const filtradas = solicitudes.filter(s => {
        const coincideTexto =
            (s.titulo || "").toLowerCase().includes(texto) ||
            (s.solicitante || "").toLowerCase().includes(texto);

        const coincideEstado = !estado || s.estado === estado;

        return coincideTexto && coincideEstado;
    });

    if (filtradas.length === 0) {
        tablaRevision.innerHTML = `
            <tr>
                <td colspan="7">No se encontraron solicitudes.</td>
            </tr>
        `;
        return;
    }

    tablaRevision.innerHTML = filtradas.map(s => `
        <tr>
            <td>${escaparHTML(s.titulo)}</td>
            <td>${escaparHTML(s.tipo_documento)}</td>
            <td>${escaparHTML(s.solicitante)}</td>
            <td>${escaparHTML(s.riesgo || "Sin evaluar")}</td>
            <td>${escaparHTML(s.prioridad || "Sin asignar")}</td>
            <td>
                <span class="status ${escaparHTML(s.estado)}">
                    ${escaparHTML(s.estado)}
                </span>
            </td>
            <td>
                <button
                    class="btn-view"
                    type="button"
                    data-id="${escaparHTML(s.id)}"
                >
                    <i class="fas fa-eye"></i>
                    Revisar
                </button>
            </td>
        </tr>
    `).join("");
}

function abrirRevision(id) {
    const solicitud = solicitudes.find(
        s => String(s.id) === String(id)
    );

    if (!solicitud) return;

    solicitudSeleccionada = solicitud;

    detalleDocumento.innerHTML = `
        <div class="detail-grid">
            <p><strong>Documento:</strong><br>
                ${escaparHTML(solicitud.titulo)}</p>

            <p><strong>Tipo:</strong><br>
                ${escaparHTML(solicitud.tipo_documento)}</p>

            <p><strong>Solicitante:</strong><br>
                ${escaparHTML(solicitud.solicitante)}</p>

            <p><strong>Estado:</strong><br>
                ${escaparHTML(solicitud.estado)}</p>

            <p><strong>Riesgo:</strong><br>
                ${escaparHTML(solicitud.riesgo || "Sin evaluar")}</p>

            <p><strong>Prioridad:</strong><br>
                ${escaparHTML(solicitud.prioridad || "Sin asignar")}</p>
        </div>

        <div class="description-box">
            <strong>Descripción del documento</strong>
            <p>${escaparHTML(solicitud.descripcion)}</p>
        </div>
    `;

    observaciones.value = "";
    mensajeRevision.textContent = "";

    const puedeDecidir = ["pendiente", "en_revision"].includes(solicitud.estado);

    document.getElementById("aprobarSolicitud").disabled = !puedeDecidir;
    document.getElementById("rechazarSolicitud").disabled = !puedeDecidir;

    mensajeRevision.textContent = puedeDecidir
        ? ""
        : "Esta solicitud ya tiene una decisión registrada.";

    modal.hidden = false;
}

async function decidirSolicitud(estado) {
    if (!solicitudSeleccionada) return;

    const textoObservaciones = observaciones.value.trim();

    if (!textoObservaciones) {
        mensajeRevision.textContent =
            "Escribe las observaciones antes de registrar la decisión.";
        return;
    }

    const confirmar = confirm(
        estado === "aprobada"
            ? "¿Confirmas la aprobación de esta solicitud?"
            : "¿Confirmas el rechazo de esta solicitud?"
    );

    if (!confirmar) return;

    try {
        const respuesta = await fetch(
            `/solicitudes/${encodeURIComponent(solicitudSeleccionada.id)}/decision`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    estado: estado,
                    observaciones: textoObservaciones
                })
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.detail || "No se pudo registrar la decisión."
            );
        }

        alert(
            estado === "aprobada"
                ? "Solicitud aprobada correctamente."
                : "Solicitud rechazada correctamente."
        );

        modal.hidden = true;
        solicitudSeleccionada = null;

        await cargarSolicitudes();

    } catch (error) {
        mensajeRevision.textContent = error.message;
    }
}

tablaRevision.addEventListener("click", event => {
    const boton = event.target.closest("button[data-id]");

    if (boton) {
        abrirRevision(boton.dataset.id);
    }
});

buscarRevision.addEventListener("input", mostrarSolicitudes);
filtroRevision.addEventListener("change", mostrarSolicitudes);

document.getElementById("cerrarModal").addEventListener("click", () => {
    modal.hidden = true;
    solicitudSeleccionada = null;
});

modal.addEventListener("click", event => {
    if (event.target === modal) {
        modal.hidden = true;
        solicitudSeleccionada = null;
    }
});

document.getElementById("aprobarSolicitud").addEventListener("click", () => {
    decidirSolicitud("aprobada");
});

document.getElementById("rechazarSolicitud").addEventListener("click", () => {
    decidirSolicitud("rechazada");
});

cargarSolicitudes();

