
async function cargarSolicitudes() {
    const tabla = document.getElementById("tablaSolicitudes");

    try {
        const respuesta = await fetch("/solicitudes");

        if (!respuesta.ok) {
            throw new Error("No fue posible consultar las solicitudes");
        }

        const solicitudes = await respuesta.json();

        const pendientes = solicitudes.filter(s => s.estado === "pendiente").length;
        const aprobadas = solicitudes.filter(s => s.estado === "aprobada").length;
        const rechazadas = solicitudes.filter(s => s.estado === "rechazada").length;

        document.getElementById("totalSolicitudes").textContent = solicitudes.length;
        document.getElementById("pendientes").textContent = pendientes;
        document.getElementById("aprobadas").textContent = aprobadas;
        document.getElementById("rechazadas").textContent = rechazadas;

        if (solicitudes.length === 0) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        No hay solicitudes registradas.
                    </td>
                </tr>`;
            return;
        }

        tabla.innerHTML = solicitudes.slice(0, 10).map(s => {
            const fecha = s.fecha_creacion
                ? new Date(s.fecha_creacion).toLocaleDateString("es-MX")
                : "Sin fecha";

            const estado = s.estado || "pendiente";

            const nombresEstado = {
                pendiente: "Pendiente",
                en_revision: "En revisión",
                aprobada: "Aprobada",
                rechazada: "Rechazada"
            };

            return `
                <tr>
                    <td>${escaparHTML(s.titulo)}</td>
                    <td>${escaparHTML(s.tipo_documento)}</td>
                    <td>${escaparHTML(s.solicitante)}</td>
                    <td>${fecha}</td>
                    <td>
                        <span class="status status-${estado}">
                            ${nombresEstado[estado] || "Sin estado"}
                        </span>
                    </td>
                </tr>`;
        }).join("");

    } catch (error) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    No se pudieron cargar las solicitudes.
                </td>
            </tr>`;
        console.error(error);
    }
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

cargarSolicitudes();
