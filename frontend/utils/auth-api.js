import { apiRequest } from "./api.js";

// Envía la solicitud de inicio de sesión a la API
export function login(username, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}
