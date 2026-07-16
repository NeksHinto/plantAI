// plantas.js
import { Router } from "express";
import { identifySpecies, identifyDisease } from "../services/serviciosExternos.js";
import { getPlantById, getHealthRecordsByPlantId, updatePlant, insertPlant, insertHealthRecord } from "../db/plants.js";

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

    const plantName = name || (identification?.commonName !== "Unknown common name" ? identification.commonName : "New Plant");
    const plantSpecies = identification?.species || "Unknown species";

    const newPlant = await insertPlant(Number(userId), Number(roomId), plantName, plantSpecies, imageUrl);

    const diagnosisText = diagnosis?.diagnosis || "no disease";
    const diagnosisAccuracy = diagnosis?.accuracy !== undefined ? diagnosis.accuracy : 100.00;

    const newRecord = await insertHealthRecord(newPlant.id, diagnosisText, diagnosisAccuracy);

    res.status(201).json({
      message: "Plant identified and scanned successfully",
      plant: {
        id: newPlant.id,
        userId: newPlant.user_id,
        roomId: newPlant.room_id,
        name: newPlant.name,
        species: newPlant.species,
        imageUrl: newPlant.image_url,
        confidence_score: identification?.accuracy || 100.0, // Campo no persistido en BD original (fallback)
        common_name: identification?.commonName || newPlant.species // Campo no persistido en BD original (fallback)
      },
      initialDiagnosis: {
        diagnosis: newRecord.diagnosis,
        accuracy: newRecord.accuracy ? Number(newRecord.accuracy) : 100
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

    const diagnosisText = diagnosis?.diagnosis || "no disease";
    const diagnosisAccuracy = diagnosis?.accuracy !== undefined ? diagnosis.accuracy : 100.00;

    const newRecord = await insertHealthRecord(Number(plantId), diagnosisText, diagnosisAccuracy);

    res.status(201).json({
      message: "Disease diagnosis completed",
      healthRecord: {
        id: newRecord.id,
        plantId: newRecord.plant_id,
        diagnosis: newRecord.diagnosis,
        accuracy: newRecord.accuracy ? Number(newRecord.accuracy) : 100,
        date: newRecord.date
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
