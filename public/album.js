
document.addEventListener("DOMContentLoaded", () => {

  const usuarioLogueado = document.body.getAttribute("data-usuario-logueado")

  const imagenes = document.querySelectorAll(".imagen-item")
  imagenes.forEach((item) => {
    const imageId = item.getAttribute("data-image-id");
    if (imageId) {cargarComentarios(imageId)
    }
  })
})

function getImageIdFromElement(element) {
  const imageId = element.getAttribute("data-image-id")
  return imageId
}
function mostrarMensajeInvitado(imageId) {
  const container = document.getElementById(`comentarios-${imageId}`)
  if (container) {
    container.innerHTML =
      '<p style="color: #666; font-style: italic;">Inicia sesión para ver y escribir comentarios.</p>'
  }
}
async function enviarComentario(imageId) {
  const form = event.target.closest(".comentario-form")
  const input = form.querySelector(".comentario-input")
  const texto = input.value.trim()

  if (!texto) {
    alert("Escribe un comentario")
    return
  }

  try {
    const response = await fetch(`/comentarios/imagen/${imageId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ texto: texto }),
    })
    const data = await response.json()
    if (response.ok && data.success) {
      input.value = ""
      await cargarComentarios(imageId)
    } else {
      console.error("Error en la respuesta:", data)
      alert("Error al enviar comentario: " + (data.error || "Error desconocido"))
    }
  } catch (err) {
    console.error("Error al enviar comentario:", err)
    alert("Error de conexión: " + err.message)
  }
}

async function cargarComentarios(imageId) {
  try {
    const response = await fetch(`/comentarios/imagen/${imageId}`)
    const data = await response.json()

    if (data.success) {
      mostrarComentarios(imageId, data.comentarios)
    } else {
      console.error("Error al cargar comentarios:", data)
    }
  } catch (err) {
    console.error("Error al cargar comentarios:", err)
  }
}

function mostrarComentarios(imageId, comentarios) {
  const container = document.getElementById(`comentarios-${imageId}`)
  if (!container) {
    console.error(` No se encontró el contenedor comentarios-${imageId}`)
    return
  }
  if (comentarios.length === 0) {
    container.innerHTML = '<p style="color: #666; font-style: italic;">No hay comentarios aún.</p>'
    return
  }

  const comentariosHTML = comentarios
    .map(
      (comentario) => `
    <div class="comentario">
      <div class="comentario-autor">${comentario.User.nombre}</div>
      <p class="comentario-texto">${comentario.texto}</p>
      <div class="comentario-fecha">${new Date(comentario.created_at).toLocaleString()}</div>
    </div>
  `,
    )
    .join("")
  container.innerHTML = comentariosHTML
}
