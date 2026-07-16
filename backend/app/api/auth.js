// auth.js
import { Router } from "express";
import { getUserByUsername } from "../db/users.js";
export const endpointsAuth = Router();

// login(user + password)
endpointsAuth.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing required fields (email, password)" });
  }

  try {
    const user = await getUserByUsername(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

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
