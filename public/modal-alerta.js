
window.alert = (mensaje) => {
  mostrarModalAlerta(mensaje)
}

function mostrarModalAlerta(mensaje, titulo = "Mensaje") {
  const modal = document.getElementById("modalAlerta")
  const mensajeElement = document.getElementById("modalAlertaMensaje")
  const tituloElement = document.querySelector(".modal-alerta-titulo")

  if (modal && mensajeElement) {
    tituloElement.textContent = titulo
    mensajeElement.textContent = mensaje
    modal.classList.add("show")

    setTimeout(() => {
      document.querySelector(".modal-alerta-btn-ok").focus()
    }, 100)
  } else {    console.warn("Modal de alerta no encontrado, usando alert nativo")
    window._originalAlert(mensaje)
  }
}

function cerrarModalAlerta() {
  const modal = document.getElementById("modalAlerta")
  if (modal) {
    modal.classList.remove("show")
  }
}


window._originalAlert = window.alert


document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modalAlerta")
  if (modal) {
    const fondo = modal.querySelector(".modal-alerta-fondo")
    if (fondo) {
      fondo.addEventListener("click", cerrarModalAlerta)
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("show")) {
        cerrarModalAlerta()
      }
    })
  }
})
