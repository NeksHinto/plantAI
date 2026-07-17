import { clearSession } from "./session.js";

function setupHeader() {
  const logoutButton = document.querySelector(".app-header__logout");

  if (logoutButton) {
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();

      clearSession();
      window.location.href = "../index.html";
    });
  }
}

document.addEventListener("components:loaded", setupHeader);