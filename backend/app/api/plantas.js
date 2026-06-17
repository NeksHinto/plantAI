import { Router } from "express";
import { identificarPlanta, diagnosticarSalud } from "../services/serviciosExternos.js";

export const endpointsPlantas = Router();

endpointsPlantas.post("/escanear", async (req, res) => {
  const { urlFoto } = req.body;
  if (!urlFoto) return res.status(400).send("Falta urlFoto");

  try {
    const [identificacion, diagnostico] = await Promise.all([
      identificarPlanta(urlFoto),
      diagnosticarSalud(urlFoto)
    ]);
    res.json({ identificacion, diagnostico, timestamp: new Date() });
  } catch (error) {
    res.sendStatus(500);
  }
});