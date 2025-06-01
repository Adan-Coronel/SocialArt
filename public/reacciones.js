async function toggleReaccion(imageId) {
  try {
    const response = await fetch(`/reacciones/imagen/${imageId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (response.ok && data.success) {
      actualizarInterfazReaccion(imageId, data.action === "added", data.totalReacciones)
    } else {
      console.error("Error en la respuesta:", data)
      alert("Error al procesar reacción: " + (data.error || "Error desconocido"))
    }
  } catch (err) {
    console.error("Error al enviar reacción:", err)
    alert("Error de conexión: " + err.message)
  }
}

async function cargarReacciones(imageId) {
  try {
    const response = await fetch(`/reacciones/imagen/${imageId}`)
    const data = await response.json()

    if (data.success) {
      actualizarInterfazReaccion(imageId, data.usuarioReacciono, data.totalReacciones)
    }
  } catch (err) {
    console.error("Error al cargar reacciones:", err)
  }
}

function actualizarInterfazReaccion(imageId, usuarioReacciono, totalReacciones) {
  const btn = document.querySelector(`[data-image-id="${imageId}"] .btn-reaccion`)
  const contador = document.querySelector(`[data-image-id="${imageId}"] .contador-reacciones`)

  if (btn) {
    btn.className = `btn-reaccion ${usuarioReacciono ? "activo" : "inactivo"}`
  }

  if (contador) {
    contador.textContent = totalReacciones > 0 ? `${totalReacciones} me gusta` : ""
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const imagenes = document.querySelectorAll(".imagen-item")
  imagenes.forEach((item) => {
    const imageId = item.getAttribute("data-image-id")
    if (imageId) {
      cargarReacciones(imageId)
    }
  })
})
