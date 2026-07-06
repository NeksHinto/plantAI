import { login } from "./auth-api.js";
import { setSession, getSession } from "./session.js";
import { showError } from "./ui.js";

function initLogin() {
  if (getSession()?.userId) {
    window.location.href = "pages/dashboard.html";
    return;
  }
  const form = document.querySelector("#login-form");
  const errorSlot = document.querySelector("#login-error");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError(errorSlot);

    const email = form.email.value.trim();
    const password = form.password.value;
    const submitBtn = form.querySelector('button[type="submit"]');

    submitBtn.disabled = true;

    try {
      const session = await login(email, password);
      setSession(session);
      window.location.href = "pages/dashboard.html";
    } catch (error) {
      showError(errorSlot, error.message ?? "No se pudo iniciar sesión");
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function clearError(container) {
  if (container) container.replaceChildren();
}

document.addEventListener("components:loaded", initLogin);
