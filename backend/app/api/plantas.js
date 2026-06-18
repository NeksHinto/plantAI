import { Router } from "express";
import { identificarEspecie, identificarEnfermedad } from "../services/serviciosExternos.js";

export const endpointsPlantas = Router();

// test func
endpointsPlantas.post("/escanear", async (req, res) => {
  const { urlFoto } = req.body;
  
  if (!urlFoto) {
    return res.status(400).send("Falta urlFoto en el cuerpo de la petición");
  }

  try {
    const [identificacion, diagnostico] = await Promise.all([
      identificarEspecie(urlFoto),
      identificarEnfermedad(urlFoto)
    ]);
    
    res.json({ 
      identificacion, 
      diagnostico, 
      timestamp: new Date() 
    });
  } catch (error) {
    // fall
    res.sendStatus(500);
  }
});