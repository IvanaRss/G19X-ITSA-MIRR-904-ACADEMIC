
const tablaHistorial = document.getElementById("tablaHistorial");
const buscarHistorial = document.getElementById("buscarHistorial");
const filtroAccion = document.getElementById("filtroAccion");

let movimientos = [];

async function cargarHistorial() {
    try {
        const respuesta = await fetch("/api/historial");

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar el historial.");
        }

        movimientos = await respuesta.json();

        actualizarContadores();
        mostrarHistorial();

    } catch (error) {
        console.error(error);

        tablaHistorial.innerHTML = `
            <tr>
                <td colspan="5">Error al cargar el historial.</td>
            </tr>
        `;
    }
}

function actualizarContadores() {
    document.getElementById("totalMovimientos").textContent =
        movimientos.length;

    document.getElementById("totalAprobaciones").textContent =
        movimientos.filter(m =>
            m.accion.toLowerCase().includes("aprobada")
        ).length;

    document.getElementById("totalRechazos").textContent =
        movimientos.filter(m =>
            m.accion.toLowerCase().includes("rechazada")
        ).length;
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

function formatearFecha(fecha) {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleString("es-MX", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

function mostrarHistorial() {
    const texto = buscarHistorial.value.toLowerCase().trim();
    const accionSeleccionada = filtroAccion.value;

    const filtrados = movimientos.filter(m => {
        const coincideTexto =
            (m.documento || "").toLowerCase().includes(texto) ||
            (m.solicitante || "").toLowerCase().includes(texto) ||
            (m.observaciones || "").toLowerCase().includes(texto);

        const accion = (m.accion || "").toLowerCase();

        const coincideAccion =
            !accionSeleccionada ||
            (accionSeleccionada === "creada"
                ? accion.includes("creada")
                : accion.includes(accionSeleccionada));

        return coincideTexto && coincideAccion;
    });

    if (filtrados.length === 0) {
        tablaHistorial.innerHTML = `
            <tr>
                <td colspan="5">No se encontraron movimientos.</td>
            </tr>
        `;
        return;
    }

    tablaHistorial.innerHTML = filtrados.map(m => `
        <tr>
            <td>${escaparHTML(m.documento)}</td>
            <td>${escaparHTML(m.solicitante)}</td>
            <td>${escaparHTML(m.accion)}</td>
            <td>${escaparHTML(m.observaciones)}</td>
            <td>${escaparHTML(formatearFecha(m.fecha))}</td>
        </tr>
    `).join("");
}

buscarHistorial.addEventListener("input", mostrarHistorial);
filtroAccion.addEventListener("change", mostrarHistorial);

cargarHistorial();

