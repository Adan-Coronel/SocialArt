document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".amistades-sidebar")) {
    cargarSeguidoresSidebar()
    cargarSiguiendoSidebar()
  }
})

function mostrarTabAmistades(tab) {
  document.querySelectorAll(".amistades-tab-content").forEach((el) => {
    el.classList.add("hidden")
  })
  document.querySelectorAll(".amistades-tab-btn").forEach((el) => {
    el.classList.remove("active")
  })

  document.getElementById(`${tab}-content`).classList.remove("hidden")
  document.querySelector(`.amistades-tab-btn[onclick="mostrarTabAmistades('${tab}')"]`).classList.add("active")
}

async function cargarSeguidoresSidebar() {
  const seguidoresContent = document.getElementById("seguidores-content")
  if (!seguidoresContent) return

  try {
    const response = await fetch("/visibilidad/api/seguidores")
    const data = await response.json()

    if (data.success && data.seguidores) {
      if (data.seguidores.length === 0) {
        seguidoresContent.innerHTML = '<div class="sin-amistades">No tienes seguidores aún</div>'
        return
      }

      let html = ""
      data.seguidores.forEach((seguidor) => {
        html += `
          <div class="amistad-item">
            <div class="amistad-info">
              ${
                seguidor.foto
                  ? `<img src="${seguidor.foto}" class="amistad-avatar" alt="${seguidor.nombre}">`
                  : `<div class="amistad-avatar-placeholder">${seguidor.nombre.charAt(0)}</div>`
              }
              <div class="amistad-data">
                <p class="amistad-name">${seguidor.nombre}</p>
              </div>
            </div>
            <a href="/perfil/${seguidor.idUser}" class="amistad-btn">Ver perfil</a>
          </div>
        `
      })

      seguidoresContent.innerHTML = html
    } else {
      seguidoresContent.innerHTML = '<div class="sin-amistades">Error al cargar seguidores</div>'
    }
  } catch (err) {
    console.error("Error al cargar seguidores:", err)
    seguidoresContent.innerHTML = '<div class="sin-amistades">Error de conexión</div>'
  }
}

async function cargarSiguiendoSidebar() {
  const siguiendoContent = document.getElementById("siguiendo-content")
  if (!siguiendoContent) return

  try {
    const response = await fetch("/api/siguiendo")
    const data = await response.json()

    if (data.success && data.siguiendo) {
      if (data.siguiendo.length === 0) {
        siguiendoContent.innerHTML = '<div class="sin-amistades">No sigues a nadie aún</div>'
        return
      }

      let html = ""
      data.siguiendo.forEach((usuario) => {
        html += `
          <div class="amistad-item">
            <div class="amistad-info">
              ${
                usuario.foto
                  ? `<img src="${usuario.foto}" class="amistad-avatar" alt="${usuario.nombre}">`
                  : `<div class="amistad-avatar-placeholder">${usuario.nombre.charAt(0)}</div>`
              }
              <div class="amistad-data">
                <p class="amistad-name">${usuario.nombre}</p>
              </div>
            </div>
            <a href="/perfil/${usuario.idUser}" class="amistad-btn">Ver perfil</a>
          </div>
        `
      })

      siguiendoContent.innerHTML = html
    } else {
      siguiendoContent.innerHTML = '<div class="sin-amistades">Error al cargar usuarios seguidos</div>'
    }
  } catch (err) {
    console.error("Error al cargar siguiendo:", err)
    siguiendoContent.innerHTML = '<div class="sin-amistades">Error de conexión</div>'
  }
}
