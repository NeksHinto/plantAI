import { login } from "./auth-api.js";
import { setSession, getSession } from "./session.js";
import { showError } from "./ui.js";

function checkExistingSession() {
  const session = getSession();
  if (session?.userId && session?.token) {
    window.location.replace("pages/dashboard.html");
    return true;
  }
  return false;
}

function initLogin() {
  if (checkExistingSession()) return;

  const form = document.querySelector("#login-form");
  const errorSlot = document.querySelector("#login-error");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError(errorSlot);

    const username = form.username.value.trim();
    const password = form.password.value;
    const submitBtn = form.querySelector('button[type="submit"]');

    submitBtn.disabled = true;

    try {
      const session = await login(username, password);
      setSession(session);
      window.location.replace("pages/dashboard.html");
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

window.addEventListener("pageshow", checkExistingSession);
document.addEventListener("components:loaded", initLogin);
