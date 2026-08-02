// auth.js
import { Router } from "express";
import { getUserByUsername } from "../db/dataAccess.js";
export const endpointsAuth = Router();

// login(user + password)
endpointsAuth.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing required fields (username, password)" });
  }

  try {
    const user = await getUserByUsername(username);

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
