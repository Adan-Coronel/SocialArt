class EstadisticasManager {
  constructor() {
    this.container = null
    this.init()
  }

  init() {
    this.crearContainer()
    this.cargarEstadisticas()
  }

  crearContainer() {
    this.container = document.createElement("div")
    this.container.className = "estadisticas-container"
    this.container.innerHTML = `
      <div class="estadisticas-header">
        <h2>📊 Estadísticas de tu Perfil</h2>
        <button class="btn-actualizar" onclick="estadisticas.cargarEstadisticas()">
          🔄 Actualizar
        </button>
      </div>
      <div class="estadisticas-content">
        <div class="loading">Cargando estadísticas...</div>
      </div>
    `

    const h1 = document.querySelector("main h1")
    if (h1) {
      h1.parentNode.insertBefore(this.container, h1.nextSibling)
    }
  }

  async cargarEstadisticas() {
    try {
      const content = this.container.querySelector(".estadisticas-content")
      content.innerHTML = '<div class="loading">Cargando estadísticas...</div>'

      const response = await fetch("/estadisticas/perfil")
      const data = await response.json()

      if (data.success) {
        this.mostrarEstadisticas(data.estadisticas)
      } else {
        content.innerHTML = '<div class="error">Error al cargar estadísticas: ' + (data.error || "Error desconocido") + "</div>"
      }
    } catch (err) {
      console.error("Error al cargar estadísticas:", err)
      const content = this.container.querySelector(".estadisticas-content")
      content.innerHTML = '<div class="error">Error de conexión' + err.message + "</div>";
    }
  }

  mostrarEstadisticas(stats) {
    const content = this.container.querySelector(".estadisticas-content")

    content.innerHTML = `
      <div class="estadisticas-grid">
        <div class="estadistica-card">
          <div class="estadistica-numero">${stats.totalAlbumes}</div>
          <div class="estadistica-label">Álbumes Creados</div>
        </div>
        <div class="estadistica-card">
          <div class="estadistica-numero">${stats.totalImagenes}</div>
          <div class="estadistica-label">Imágenes Subidas</div>
        </div>
        <div class="estadistica-card">
          <div class="estadistica-numero">${stats.totalReaccionesRecibidas}</div>
          <div class="estadistica-label">Me Gusta Recibidos</div>
        </div>
        <div class="estadistica-card">
          <div class="estadistica-numero">${stats.totalComentariosRecibidos}</div>
          <div class="estadistica-label">Comentarios Recibidos</div>
        </div>
      </div>

      ${
        stats.albumMasPopular
          ? `
        <div class="album-popular">
          <h4>🏆 Álbum Más Popular</h4>
          <p><strong>${stats.albumMasPopular.titulo}</strong></p>
          <p>${stats.albumMasPopular.totalReacciones} reacciones</p>
        </div>
      `
          : `
        <div class="album-popular">
          <h4>🏆 Álbum Más Popular</h4>
          <p>Aún no tienes álbumes con reacciones</p>
        </div>
      `
      }

      <div class="actividad-reciente">
        <h4>📈 Actividad Reciente (últimos 30 días)</h4>
        <div class="actividad-item">
          <span>Imágenes subidas:</span>
          <strong>${stats.actividadReciente.imagenesSubidas}</strong>
        </div>
        <div class="actividad-item">
          <span>Comentarios recibidos:</span>
          <strong>${stats.actividadReciente.comentariosRecibidos}</strong>
        </div>
        <div class="actividad-item">
          <span>Reacciones recibidas:</span>
          <strong>${stats.actividadReciente.reaccionesRecibidas}</strong>
        </div>
      </div>
    `
  }
}

let estadisticas
document.addEventListener("DOMContentLoaded", () => {

  if (window.location.pathname === "/perfil") {
    estadisticas = new EstadisticasManager()
  }
})
