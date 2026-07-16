// auth.js
import { Router } from "express";
import { db } from "../db/pool.js";
export const endpointsAuth = Router();

// login(user + passw)
endpointsAuth.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing required fields (email, password)" });
  }

  try {
    const result = await db.query(
      "SELECT id, name, password FROM users WHERE username = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.json({
      userId: user.id,
      nombre: user.name
    });

  } catch (error) {
    console.error("login error:", error);
    res.sendStatus(500);
  }
});
