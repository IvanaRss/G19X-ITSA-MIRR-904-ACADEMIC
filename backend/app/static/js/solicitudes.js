
const tabla = document.getElementById("tablaSolicitudes");
const buscador = document.getElementById("buscador");
const filtroEstado = document.getElementById("filtroEstado");

let solicitudes = [];

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

        tabla.innerHTML = `
            <tr>
                <td colspan="7">Error al cargar las solicitudes.</td>
            </tr>
        `;
    }
}

function actualizarContadores() {
    document.getElementById("totalSolicitudes").textContent =
        solicitudes.length;

    document.getElementById("pendientes").textContent =
        solicitudes.filter(s => s.estado === "pendiente").length;

    document.getElementById("aprobadas").textContent =
        solicitudes.filter(s => s.estado === "aprobada").length;

    document.getElementById("rechazadas").textContent =
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

function formatearEstado(estado) {
    const estados = {
        pendiente: "Pendiente",
        en_revision: "En revisión",
        aprobada: "Aprobada",
        rechazada: "Rechazada"
    };

    return estados[estado] || estado;
}

function mostrarSolicitudes() {
    const texto = buscador.value.toLowerCase().trim();
    const estadoSeleccionado = filtroEstado.value;

    const filtradas = solicitudes.filter(solicitud => {
        const coincideTexto =
            (solicitud.titulo || "").toLowerCase().includes(texto) ||
            (solicitud.solicitante || "").toLowerCase().includes(texto);

        const coincideEstado =
            !estadoSeleccionado ||
            solicitud.estado === estadoSeleccionado;

        return coincideTexto && coincideEstado;
    });

    if (filtradas.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="7">No se encontraron solicitudes.</td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = filtradas.map(solicitud => {
        const fecha = solicitud.fecha_creacion
            ? new Date(solicitud.fecha_creacion).toLocaleDateString("es-MX")
            : "Sin fecha";

        return `
            <tr>
                <td>#${escaparHTML(solicitud.id)}</td>
                <td>${escaparHTML(solicitud.titulo)}</td>
                <td>${escaparHTML(solicitud.tipo_documento)}</td>
                <td>${escaparHTML(solicitud.solicitante)}</td>
                <td>${escaparHTML(fecha)}</td>
                <td>
                    <span class="status ${escaparHTML(solicitud.estado)}">
                        ${escaparHTML(formatearEstado(solicitud.estado))}
                    </span>
                </td>
                <td>
                    <button
                        class="btn-view"
                        type="button"
                        onclick="verSolicitud('${escaparHTML(solicitud.id)}')"
                        title="Ver detalles"
                    >
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

function verSolicitud(id) {
    const solicitud = solicitudes.find(
        elemento => String(elemento.id) === String(id)
    );

    if (!solicitud) return;

    alert(
        `DETALLES DE LA SOLICITUD\n\n` +
        `Documento: ${solicitud.titulo}\n` +
        `Tipo: ${solicitud.tipo_documento}\n` +
        `Solicitante: ${solicitud.solicitante}\n` +
        `Estado: ${formatearEstado(solicitud.estado)}\n\n` +
        `Descripción:\n${solicitud.descripcion}`
    );
}

buscador.addEventListener("input", mostrarSolicitudes);
filtroEstado.addEventListener("change", mostrarSolicitudes);

cargarSolicitudes();
