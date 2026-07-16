// plantas.js
import { Router } from "express";
import { identifySpecies, identifyDisease } from "../services/serviciosExternos.js";
import { getPlantById, getHealthRecordsByPlantId, updatePlant } from "../db/plants.js";

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
    const plantRow = await getPlantById(plantId);

    if (!plantRow) {
      return res.status(404).json({ error: "Plant not found" });
    }

    const recordsRows = await getHealthRecordsByPlantId(plantId);

    const healthRecords = recordsRows.map(row => ({
      id: row.id,
      plantId: row.plant_id,
      diagnosis: row.diagnosis,
      accuracy: row.accuracy ? Number(row.accuracy) : 0,
      date: row.date
    }));

    res.json({
      id: plantRow.id,
      userId: plantRow.user_id,
      roomId: plantRow.room_id,
      name: plantRow.name,
      species: plantRow.species || "Especie desconocida",
      imageUrl: plantRow.image_url,
      healthRecords
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
    const updatedPlant = await updatePlant(plantId, name, roomId);

    if (!updatedPlant) {
      return res.status(404).json({ error: "Plant not found" });
    }

    res.json({
      message: "Plant updated successfully",
      plant: {
        id: updatedPlant.id,
        userId: updatedPlant.user_id,
        roomId: updatedPlant.room_id,
        name: updatedPlant.name,
        species: updatedPlant.species || "Especie desconocida",
        imageUrl: updatedPlant.image_url
      }
    });

  } catch (error) {
    console.error("Error en edit-plant:", error);
    res.sendStatus(500);
  }
});
