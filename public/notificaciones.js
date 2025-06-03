class NotificacionesManager {
  constructor() {
    this.panel = null
    this.overlay = null
    this.badge = null
    this.hayMas = false
    this.init()
  }

  init() {
    this.crearElementos()
    this.cargarNotificaciones()
    setInterval(() => this.cargarNotificaciones(), 30000)
  }

  crearElementos() {
    this.badge = document.querySelector(".notificaciones-badge")
  }

  async cargarNotificaciones() {
    try {
      const response = await fetch("/notificaciones/api/pendientes")
      const data = await response.json()

      if (data.success) {
        this.actualizarBadge(data.count)
        this.hayMas = data.hayMas
        this.actualizarPanel(data.notificaciones)
      }
    } catch (err) {
      console.error("Error al cargar notificaciones:", err)
    }
  }

  actualizarBadge(count) {
    if (this.badge) {
      if (count > 0) {
        this.badge.textContent = count > 99 ? "99+" : count
        this.badge.style.display = "flex"
      } else {
        this.badge.style.display = "none"
      }
    }
  }

  togglePanel() {
    if (!this.panel) {
      this.crearPanel()
    }

    const isVisible = this.panel.classList.contains("show")

    if (isVisible) {
      this.cerrarPanel()
    } else {
      this.abrirPanel()
    }
  }

  crearPanel() {
    this.overlay = document.createElement("div")
    this.overlay.className = "notificaciones-overlay"
    this.overlay.onclick = () => this.cerrarPanel()

    this.panel = document.createElement("div")
    this.panel.className = "notificaciones-panel"

    document.body.appendChild(this.overlay)
    document.querySelector(".notificaciones-container").appendChild(this.panel)
  }

  abrirPanel() {
    this.cargarNotificaciones()
    this.panel.classList.add("show")
    this.overlay.classList.add("show")
  }

  cerrarPanel() {
    this.panel.classList.remove("show")
    this.overlay.classList.remove("show")
  }

  verTodasLasNotificaciones() {
    window.location.href = "/notificaciones/todas"
  }

  actualizarPanel(notificaciones) {
    if (!this.panel) return

    let html = `
      <div class="notificaciones-header">
        <h3 class="notificaciones-titulo">Notificaciones</h3>
        <button class="ver-todas-btn" onclick="notificaciones.verTodasLasNotificaciones()">Ver todas</button>
      </div>
    `

    if (notificaciones.length === 0) {
      html += '<div class="sin-notificaciones">No tienes notificaciones pendientes</div>'
    } else {
      notificaciones.forEach((notificacion) => {
        const avatar = notificacion.emisor.foto
          ? `<img src="${notificacion.emisor.foto}" class="notificacion-avatar" alt="${notificacion.emisor.nombre}">`
          : `<div class="notificacion-avatar-placeholder">${notificacion.emisor.nombre.charAt(0)}</div>`

        let acciones = ""
        if (notificacion.tipo === "solicitud_amistad") {
          acciones = `
            <div class="notificacion-acciones">
              <button class="btn-aceptar" onclick="notificaciones.manejarAccion(${notificacion.idNotification}, 'aceptar')">
                Aceptar
              </button>
              <button class="btn-rechazar" onclick="notificaciones.manejarAccion(${notificacion.idNotification}, 'rechazar')">
                Rechazar
              </button>
            </div>
          `
        } else if (notificacion.tipo === "comentario") {
          acciones = `
            <div class="notificacion-acciones">
              <button class="btn-ver" onclick="notificaciones.irAComentario(${notificacion.ref_id}, ${notificacion.idNotification})">
                Ver comentario
              </button>
              <button class="btn-marcar-leida" onclick="notificaciones.marcarComoLeida(${notificacion.idNotification})">
                ✓ Marcar leída
              </button>
            </div>
          `
        } else if (notificacion.tipo === "solicitud_aceptada") {
          acciones = `
            <div class="notificacion-acciones">
              <button class="btn-ver-perfil" onclick="notificaciones.irAPerfil(${notificacion.emisor.idUser}, ${notificacion.idNotification})">
                Ver perfil
              </button>
              <button class="btn-marcar-leida" onclick="notificaciones.marcarComoLeida(${notificacion.idNotification})">
                ✓ Marcar leída
              </button>
            </div>
          `
        } else if (notificacion.tipo === "reaccion") {

          acciones = `
            <div class="notificacion-acciones">
              <button class="btn-ver" onclick="notificaciones.irAImagen(${notificacion.ref_id}, ${notificacion.idNotification})">
                Ver álbum
              </button>
              <button class="btn-marcar-leida" onclick="notificaciones.marcarComoLeida(${notificacion.idNotification})">
                ✓ Marcar leída
              </button>
            </div>
          `
        }
        html += `
          <div class="notificacion-item ${notificacion.leido ? "leida" : "no-leida"}">
            ${avatar}
            <div class="notificacion-content">
              <div class="notificacion-texto">
                <strong>${notificacion.emisor.nombre}</strong> ${notificacion.mensaje}
              </div>
              <div class="notificacion-tiempo">
                ${this.formatearTiempo(notificacion.created_at)}
              </div>
              ${acciones}
            </div>
          </div>
        `
      })
    }

    this.panel.innerHTML = html
  }

  async irAComentario(comentarioId, notificationId) {
    try {
      await this.marcarComoLeida(notificationId)
      const response = await fetch(`/comentarios/info/${comentarioId}`)
      const data = await response.json()

      if (data.success && data.albumId) {
        window.location.href = `/albums/${data.albumId}#comentario-${comentarioId}`
      } else {
        console.error("No se pudo obtener información del comentario")
      }
    } catch (err) {
      console.error("Error al ir al comentario:", err)
    }
  }
  async irAImagen(imageId, notificationId) {
    try {
      await this.marcarComoLeida(notificationId)
      //const response = await fetch(`/comentarios/info/${imageId}`)
      const response = await fetch(`/albums/info/${imageId}`)
      const data = await response.json()

      if (data.success && data.albumId) {
        window.location.href = `/albums/${data.albumId}#imagen-${imageId}`
      } else {
        console.error("No se pudo obtener información de la imagen")
         window.location.href = `/albums`
      }
    } catch (err) {
      console.error("Error al ir a la imagen:", err)
       window.location.href = `/albums`
    }
  }

  async irAPerfil(userId, notificationId) {
    try {
      
      await this.marcarComoLeida(notificationId)

      window.location.href = `/perfil/${userId}`
    } catch (err) {
      console.error("Error al ir al perfil:", err)

      window.location.href = `/perfil/${userId}`
    }
  }

 
  async marcarComoLeida(notificationId) {
    try {
      console.log(`🔍 Marcando como leída notificación ${notificationId}`)

      const response = await fetch(`/notificaciones/marcar-leida/${notificationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const result = await response.json()
      console.log("Respuesta:", result)

      if (response.ok && result.success) {
        console.log("Notificación marcada como leída exitosamente")
        
        await this.cargarNotificaciones()
        return true
      } else {
        console.error("Error al marcar como leída:", result)
        return true
      }
    } catch (err) {
      console.error("Error al marcar como leída:", err)
      return true
    }
  }

  async manejarAccion(notificationId, action) {
    try {
      const response = await fetch(`/notificaciones/accion/${notificationId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        this.cargarNotificaciones()
      } else {
        alert("Error al procesar la acción")
      }
    } catch (err) {
      alert("Error de conexión")
    }
  }

  formatearTiempo(fecha) {
    const ahora = new Date()
    const notificacion = new Date(fecha)
    const diff = ahora - notificacion

    const minutos = Math.floor(diff / 60000)
    const horas = Math.floor(diff / 3600000)
    const dias = Math.floor(diff / 86400000)

    if (minutos < 1) return "Ahora"
    if (minutos < 60) return `${minutos}m`
    if (horas < 24) return `${horas}h`
    return `${dias}d`
  }
}

let notificaciones
document.addEventListener("DOMContentLoaded", () => {
  notificaciones = new NotificacionesManager()
})
