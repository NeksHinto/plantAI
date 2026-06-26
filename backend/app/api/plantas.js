// plantas.js
import { Router } from "express";
import { identifySpecies, identifyDisease } from "../services/serviciosExternos.js";

export const endpointsPlantas = Router();

// add-plant(image): identifica la especie de planta y realiza un diagnostico.
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

// identify-disease(image): Realiza y devuelve diagnostico 
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

// get-plant-by-id(plantId): Devuelve detalles de la planta incluyendo su historial clínico
endpointsPlantas.get("/:plantId", async (req, res) => {
  const { plantId } = req.params;

  try {
    //TODO: BD, Obtener los detalles de la planta desde la tabla "Plants"
    //TODO: BD, Obtener el historial clínico de salud de la planta desde "PlantHealthRecord":

    // Respuesta simulada
    res.json({
      id: Number(plantId),
      userId: 1,
      roomId: 2,
      name: "Helecho",
      species: "Monstera deliciosa",
      species_class: "Unknown family",
      imageUrl: "dummy image",
      confidence_score: 80.1,
      common_name: "Monstera",
      healthRecords: [
        {
          id: 101,
          plantId: Number(plantId),
          diagnosis: "No disease detected",
          accuracy: 100,
          date: new Date("2026-06-25T10:00:00.000Z")
        },
        {
          id: 102,
          plantId: Number(plantId),
          diagnosis: "Rhizoctonia solani - Viruela de la patata",
          accuracy: 7.27,
          date: new Date()
        }
      ]
    });

  } catch (error) {
    console.error("Error en get-plant-by-id:", error);
    res.sendStatus(500);
  }
});

// edit-plant(plantId, {campos modificados}): Modifica los datos de la planta (nombre, ambiente, etc.)
endpointsPlantas.put("/:plantId", async (req, res) => {
  const { plantId } = req.params;
  const { name, roomId } = req.body;

  try {
    // TODO: BD, Actualizar la planta en la tabla "Plants":

    // Respuesta simulada
    res.json({
      message: "Plant updated successfully ",
      plant: {
        id: Number(plantId),
        userId: 1,
        roomId: roomId ? Number(roomId) : 2,
        name: name || "Helecho",
        species: "Monstera deliciosa",
        species_class: "Unknown family",
        imageUrl: "dummy image",
        confidence_score: 80.1,
        common_name: "Monstera"
      }
    });

  } catch (error) {
    console.error("Error en edit-plant:", error);
    res.sendStatus(500);
  }
});
