const io = window.io
class NotificacionesRealTimeManager {
  constructor() {
    this.socket = null
    this.token = this.obtenerToken()
    this.init()
  }

  obtenerToken() {

    const cookies = document.cookie.split(";")
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=")
      if (name === "token") {
        return value
      }
    }
    return null
  }

  init() {
    if (!this.token) {
      console.log("No hay token, usuario no autenticado")
      return
    }

    this.socket = io({
      auth: {
        token: this.token,
      },
    })

    this.socket.on("connect", () => {
      console.log("Conectado a notificaciones en tiempo real")
    })

    this.socket.on("nueva_notificacion", (notificacion) => {
      this.mostrarNotificacionEnTiempoReal(notificacion)
      this.actualizarContadorNotificaciones()
    })

    this.socket.on("disconnect", () => {
      console.log("Desconectado de notificaciones en tiempo real")
    })

    this.socket.on("connect_error", (error) => {
      console.error("Error de conexión:", error)
    })
  }

  mostrarNotificacionEnTiempoReal(notificacion) {
    this.crearNotificacionToast(notificacion)

    this.reproducirSonidoNotificacion()
  }

  crearNotificacionToast(notificacion) {
    const toast = document.createElement("div")
    toast.className = "notification-toast"
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-avatar">
          ${
            notificacion.from_user.foto
              ? `<img src="${notificacion.from_user.foto}" alt="${notificacion.from_user.nombre}">`
              : `<div class="avatar-placeholder">${notificacion.from_user.nombre.charAt(0)}</div>`
          }
        </div>
        <div class="toast-message">
          <strong>${notificacion.from_user.nombre}</strong>
          <p>${notificacion.mensaje}</p>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
      </div>
    `

    document.body.appendChild(toast)
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove()
      }
    }, 5000)

    setTimeout(() => {
      toast.classList.add("show")
    }, 100)
  }

  reproducirSonidoNotificacion() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (err) {
      console.log("No se pudo reproducir sonido de notificación")
    }
  }

  async actualizarContadorNotificaciones() {
    if (window.notificaciones) {
      await window.notificaciones.cargarNotificaciones()
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.notificacionesRealTime = new NotificacionesRealTimeManager()
})
