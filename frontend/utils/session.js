const SESSION_KEY = "plantai_session";

// Obtiene la sesión guardada en sessionStorage
export function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Guarda los datos de sesión en sessionStorage
export function setSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// Elimina la sesión del sessionStorage
export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

// Redirige al login si el usuario no está autenticado
export function requireAuth() {
  const session = getSession();
  if (!session?.userId || !session?.token) {
    clearSession();
    const isPagesSubdir = window.location.pathname.includes("/pages/");
    const targetUrl = isPagesSubdir ? "../index.html" : "index.html";
    window.location.replace(targetUrl);
    return null;
  }
  return session;
}

// Verifica la sesión al navegar en el historial del navegador
export function setupAuthGuard() {
  window.addEventListener("pageshow", () => {
    requireAuth();
  });
}
