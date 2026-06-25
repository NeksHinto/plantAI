// plantas.js
import { Router } from "express";
import { identifySpecies, identifyDisease } from "../services/serviciosExternos.js";

export const endpointsPlantas = Router();

// Endpoint: add-plant(image)
// Llama a identifySpecies e identifyDisease, y simula el flujo de guardado en el ambiente del usuario
endpointsPlantas.post("/add-plant", async (req, res) => {
  const { imageUrl, userId, roomId, name } = req.body;

  if (!imageUrl || !userId || !roomId) {
    return res.status(400).json({ error: "Faltan datos obligatorios (imageUrl, userId, roomId)" });
  }

  try {
    const [identification, diagnosis] = await Promise.all([
      identifySpecies(imageUrl),
      identifyDisease(imageUrl)
    ]);

    // TODO: BD, Insertar la planta en la tabla "Plants"
    // TODO: BD, Si la identificación o el diagnóstico de salud devuelve datos,
    // TODO: BD, guardar el primer registro clínico en la tabla "PlantHealthRecord"

    // Respuesta simulada
    const plantIdSimulado = Math.floor(Math.random() * 1000) + 100;

    res.status(201).json({
      message: "Plant identified and scanned successfully",
      plant: {
        id: plantIdSimulado,
        userId: Number(userId),
        roomId: Number(roomId),
        name: name || "New Plant",
        species: identification?.species || "Unknown species",
        species_class: identification?.family || "Unknown family",
        imageUrl: imageUrl,
        confidence_score: identification?.accuracy || 0,
        common_name: identification?.commonName || "Unknown common name"
      },
      initialDiagnosis: {
        diagnosis: diagnosis?.diagnosis || "No disease detected or invalid image",
        accuracy: diagnosis?.accuracy || 100
      }
    });

  } catch (error) {
    console.error("Error en add-plant:", error);
    res.sendStatus(500);
  }
});

// Endpoint: identify-disease(image)
// Desde el escáner de salud, llama al diagnóstico y simula guardarlo en el historial clínico
endpointsPlantas.post("/identify-disease", async (req, res) => {
  const { imageUrl, plantId } = req.body;

  if (!imageUrl || !plantId) {
    return res.status(400).json({ error: "Missing required data (imageUrl, plantId)" });
  }

  try {
    const diagnosis = await identifyDisease(imageUrl);

    // TODO: BD, Insertar el registro clínico en la tabla "PlantHealthRecord"

    // Respuesta simulada
    const recordIdSimulado = Math.floor(Math.random() * 1000) + 100;

    res.status(201).json({
      message: "Disease diagnosis completed",
      healthRecord: {
        id: recordIdSimulado,
        plantId: Number(plantId),
        diagnosis: diagnosis?.diagnosis || "No disease detected or invalid image",
        accuracy: diagnosis?.accuracy || 100,
        date: new Date()
      }
    });

  } catch (error) {
    console.error("Error en identify-disease:", error);
    res.sendStatus(500);
  }
});
