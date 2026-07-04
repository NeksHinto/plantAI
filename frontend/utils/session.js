const SESSION_KEY = "plantai_session";

export function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function requireAuth() {
  const session = getSession();
  if (!session?.userId) {
    window.location.href = "../index.html";
    return null;
  }
  return session;
}
