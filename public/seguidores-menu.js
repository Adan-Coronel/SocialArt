document.addEventListener("DOMContentLoaded", () => {

  cargarSeguidores()
  cargarSiguiendo()

  document.addEventListener("click", (event) => {
    const dropdown = document.querySelector(".seguidores-dropdown")
    const menu = document.querySelector(".seguidores-menu")

    if (dropdown && menu && !dropdown.contains(event.target)) {
      menu.style.display = "none"
    }
  })
})

function mostrarTab(tab) {
  document.querySelectorAll(".tab-content").forEach((el) => {
    el.classList.add("hidden")
  })
  document.querySelectorAll(".tab-btn").forEach((el) => {
    el.classList.remove("active")
  })

  document.getElementById(`${tab}-tab`).classList.remove("hidden")

  document.querySelector(`.tab-btn[onclick="mostrarTab('${tab}')"]`).classList.add("active")
}

async function cargarSeguidores() {
  const seguidoresTab = document.getElementById("seguidores-tab")
  if (!seguidoresTab) return

  try {
    const response = await fetch("/visibilidad/api/seguidores")
    const data = await response.json()

    if (data.success && data.seguidores) {
      if (data.seguidores.length === 0) {
        seguidoresTab.innerHTML = '<div class="sin-seguidores">No tienes seguidores aún</div>'
        return
      }

      let html = ""
      data.seguidores.forEach((seguidor) => {
        html += `
          <div class="seguidor-item">
            ${
              seguidor.foto
                ? `<img src="${seguidor.foto}" class="seguidor-avatar" alt="${seguidor.nombre}">`
                : `<div class="seguidor-avatar-placeholder">${seguidor.nombre.charAt(0)}</div>`
            }
            <div class="seguidor-info">
              <p class="seguidor-nombre">${seguidor.nombre}</p>
            </div>
            <a href="/perfil/${seguidor.idUser}" class="ver-perfil-btn">Ver perfil</a>
          </div>
        `
      })

      seguidoresTab.innerHTML = html
    } else {
      seguidoresTab.innerHTML = '<div class="sin-seguidores">Error al cargar seguidores</div>'
    }
  } catch (err) {
    console.error("Error al cargar seguidores:", err)
    seguidoresTab.innerHTML = '<div class="sin-seguidores">Error de conexión</div>'
  }
}

async function cargarSiguiendo() {
  const siguiendoTab = document.getElementById("siguiendo-tab")
  if (!siguiendoTab) return

  try {
    const response = await fetch("/api/siguiendo")
    const data = await response.json()

    if (data.success && data.siguiendo) {
      if (data.siguiendo.length === 0) {
        siguiendoTab.innerHTML = '<div class="sin-siguiendo">No sigues a nadie aún</div>'
        return
      }

      let html = ""
      data.siguiendo.forEach((usuario) => {
        html += `
          <div class="siguiendo-item">
            ${
              usuario.foto
                ? `<img src="${usuario.foto}" class="siguiendo-avatar" alt="${usuario.nombre}">`
                : `<div class="siguiendo-avatar-placeholder">${usuario.nombre.charAt(0)}</div>`
            }
            <div class="siguiendo-info">
              <p class="siguiendo-nombre">${usuario.nombre}</p>
            </div>
            <a href="/perfil/${usuario.idUser}" class="ver-perfil-btn">Ver perfil</a>
          </div>
        `
      })

      siguiendoTab.innerHTML = html
    } else {
      siguiendoTab.innerHTML = '<div class="sin-siguiendo">Error al cargar usuarios seguidos</div>'
    }
  } catch (err) {
    console.error("Error al cargar siguiendo:", err)
    siguiendoTab.innerHTML = '<div class="sin-siguiendo">Error de conexión</div>'
  }
}
