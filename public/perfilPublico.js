async function enviarSolicitud(userId) {
  try {
    const response = await fetch(`/solicitudes/enviar/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    const data = await response.json()

    if (response.ok) {
      location.reload()
    } else {
      alert(data.error || "Error al enviar solicitud")
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
async function dejarDeSeguir(userId) {
  if (!confirm("¿Estás seguro de que quieres dejar de seguir a este usuario?")) {
    return
  }

  try {
    const response = await fetch(`/solicitudes/dejar-seguir/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    if (response.ok) {
      location.reload()
    } else {
      alert("Error al dejar de seguir")
    }
  } catch (err) {
    alert("Error de conexión")
  }
}

async function cancelarSeguimiento(userId) {
  if (!confirm("¿Estás seguro de que quieres cancelar que este usuario te siga?")) {
    return
  }

  try {
    const response = await fetch(`/solicitudes/cancelar-seguimiento/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    if (response.ok) {
      location.reload()
    } else {
      alert("Error al cancelar seguimiento")
    }
  } catch (err) {
    alert("Error de conexión")
  }
}
function irASolicitudes() {
  window.location.href = "/notificaciones/todas"
}
