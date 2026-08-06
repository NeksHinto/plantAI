const host =
  typeof window !== "undefined" ? window.location.hostname : "";

const isLocalHost =
  host === "localhost" ||
  host === "127.0.0.1" ||
  host === "::1" ||
  host === "[::1]";

// Local static servers (python http.server, Live Server, etc.) must hit Express on :8000.
// Relative "/api/v1" is only for same-origin deploys (Vercel / Docker frontend proxy).
export const API_BASE_URL = isLocalHost
  ? "http://localhost:8000/api/v1"
  : "/api/v1";

