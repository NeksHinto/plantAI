import { API_BASE_URL } from "./config.js";
import { getSession, clearSession, requireAuth } from "./session.js";

// Clase para manejar errores con código de estado HTTP
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Realiza peticiones HTTP a la API adjuntando el token y manejando la sesión
export async function apiRequest(path, options = {}) {
  const session = getSession();
  const isFormData = options.body instanceof FormData;

  const authHeaders = session?.token ? { Authorization: `Bearer ${session.token}` } : {};
  const defaultHeaders = isFormData ? {} : { "Content-Type": "application/json" };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...authHeaders,
      ...options.headers,
    },
  });

  if (response.status === 401 || response.status === 403) {
    if (path !== "/auth/login") {
      clearSession();
      requireAuth();
      throw new ApiError("Sesión expirada o no autorizada", response.status);
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message ?? data?.error ?? `Error ${response.status}`;
    const error = new ApiError(message, response.status);
    error.code = data?.error;
    throw error;
  }

  return data;
}
