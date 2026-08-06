// auth.js
import { Router } from "express";
import { getUserByUsername } from "../db/dataAccess.js";
import { generateToken } from "../middleware/auth.js";
export const endpointsAuth = Router();

// login(user + password)
endpointsAuth.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Faltan campos requeridos (nombre de usuario, contraseña)" });
  }

  try {
    const user = await getUserByUsername(username);

    if (!user) {
      return res.status(401).json({ error: "Credenciales invalidas" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Credenciales invalidas" });
    }

    const token = generateToken({ userId: user.id, username: user.name });

    return res.json({
      token,
      userId: user.id,
      nombre: user.name
    });

  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.sendStatus(500);
  }
});
