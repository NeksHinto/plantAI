import { clearSession } from "./session.js";

// Asigna el evento de cerrar sesión al botón del encabezado
function setupHeader() {
  const logoutButton = document.querySelector(".app-header__logout");

  if (logoutButton) {
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();

      clearSession();
      const isPagesSubdir = window.location.pathname.includes("/pages/");
      const targetUrl = isPagesSubdir ? "../index.html" : "index.html";
      window.location.replace(targetUrl);
    });
  }
}

document.addEventListener("components:loaded", setupHeader);