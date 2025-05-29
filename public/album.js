document.addEventListener("DOMContentLoaded", () => {
  console.log("Cargando página del álbum...");
  const imagenes = document.querySelectorAll(".imagen-item")
  console.log(`Encontradas ${imagenes.length} imágenes`)
  imagenes.forEach((item) => {
    const imageId = getImageIdFromElement(item)
    console.log(`Procesando imagen ID: ${imageId}`)
    if (imageId) {
      cargarComentarios(imageId)
    }
  })
})

function getImageIdFromElement(element) {
  const imageId = element.getAttribute("data-image-id")
  console.log(`ID del elemento:`, imageId)
  return imageId
}

async function enviarComentario(imageId) {
  console.log(`Enviando comentario para imagen ${imageId}`)
  const form = event.target.closest(".comentario-form")
  const input = form.querySelector(".comentario-input")
  const texto = input.value.trim()

  if (!texto) {
    alert("Escribe un comentario")
    return
  }

  try {
    console.log("Enviando comentario:", texto, "para imagen:", imageId)
    const response = await fetch(`/comentarios/imagen/${imageId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ texto: texto }),
    })
    const data = await response.json()
    console.log("Respuesta del servidor:", data)
    if (response.ok && data.success) {
      input.value = ""
      console.log("Comentario enviado exitosamente, recargando comentarios...")
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
  console.log(`Cargando comentarios para imagen ${imageId}`)
  try {
    const response = await fetch(`/comentarios/imagen/${imageId}`)
    const data = await response.json()

    console.log('Datss de comentarios recibidos:', data)
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
  console.log(`Mostrando ${comentarios.length} comentarios para imagen ${imageId}`)
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
  console.log(`Comentariosmostradrs exitosamente`)
}
