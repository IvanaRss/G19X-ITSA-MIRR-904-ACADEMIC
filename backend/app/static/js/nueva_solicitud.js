
const formulario = document.getElementById("formSolicitud");
const mensaje = document.getElementById("mensajeSolicitud");

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const datos = {
        titulo: document.getElementById("titulo").value.trim(),
        tipo_documento: document.getElementById("tipo_documento").value,
        solicitante: document.getElementById("solicitante").value.trim(),
        descripcion: document.getElementById("descripcion").value.trim()
    };

    if (
        !datos.titulo ||
        !datos.tipo_documento ||
        !datos.solicitante ||
        !datos.descripcion
    ) {
        mensaje.textContent = "Completa todos los campos obligatorios.";
        return;
    }

    const boton = formulario.querySelector('button[type="submit"]');

    boton.disabled = true;
    boton.textContent = "Registrando...";

    mensaje.textContent = "";

    try {
        const respuesta = await fetch("/solicitudes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.detail || "No se pudo registrar la solicitud."
            );
        }

        mensaje.textContent = "¡Solicitud registrada correctamente!";

        formulario.reset();

        setTimeout(() => {
            window.location.href = "/gestion-solicitudes";
        }, 1500);

    } catch (error) {
        mensaje.textContent = error.message;

    } finally {
        boton.disabled = false;
        boton.innerHTML = '<i class="fas fa-paper-plane"></i> Registrar solicitud';
    }
});
