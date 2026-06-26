// auth.js
import { Router } from "express";
export const endpointsAuth = Router();

// login(user + passw)
endpointsAuth.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing required fields (email, password)" });
  }

  try {
    // TODO: BD, Buscar el usuario en la tabla "Users":

    // Validación dummy
    if (email === "drivas@fi.uba.ar" && password === "1234") {
      return res.json({
        userId: 1,
        nombre: "Dylan"
      });
    } else {
      return res.status(401).json({ error: "Invalid credentials" });
    }

  } catch (error) {
    console.error("login error:", error);
    res.sendStatus(500);
  }
});
