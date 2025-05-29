async function enviarSolicitud(userId) {
  try {
    const response = await fetch(`/solicitudes/enviar/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    if (response.ok) {
      location.reload()
    } else {
      alert("Error al enviar solicitud")
    }
  } catch (err) {
    alert("Error de conexión")
  }
}

async function cancelarSolicitud(userId) {
  try {
    const response = await fetch(`/solicitudes/cancelar/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    if (response.ok) {
      location.reload()
    } else {
      alert("Error al cancelar solicitud")
    }
  } catch (err) {
    alert("Error de conexión")
  }
}

function irASolicitudes() {
  window.location.href = "/notificaciones/todas"
}
