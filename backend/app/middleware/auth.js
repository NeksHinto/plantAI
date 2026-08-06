import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "plantai_secret_key_2026";

// Genera un token JWT de autenticación válido por 7 días
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// Middleware que valida el token JWT del encabezado Authorization
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Token de autenticación requerido" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Token inválido o expirado" });
    }
    req.user = decoded;
    next();
  });
}
