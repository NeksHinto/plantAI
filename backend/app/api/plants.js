// plantas.js
import { Router } from "express";
import { identifySpecies, identifyDisease } from "../services/externalServices.js";
import { getPlantById, getHealthRecordsByPlantId, updatePlant, insertPlant, insertHealthRecord, getRoomContextByPlantId, deletePlant, deleteHealthRecord, updateHealthRecord } from "../db/plants.js";
import { getRoomById } from "../db/rooms.js";
import { generateTreatmentNotes } from "../services/treatmentRecommendation.js";
import { mapPlantRow } from "../services/mappers.js";

export const endpointsPlantas = Router();

// add-plant(image): identifica la especie de planta y realiza un diagnostico.
endpointsPlantas.post("/add-plant", async (req, res) => {
  const { imageUrl, userId, roomId, name } = req.body;

  if (!imageUrl || !userId || !roomId) {
    return res.status(400).json({ error: "Faltan datos obligatorios (imageUrl, userId, roomId)" });
  }

  try {
    const [identification, diagnosis, room] = await Promise.all([
      identifySpecies(imageUrl),
      identifyDisease(imageUrl),
      getRoomById(roomId)
    ]);

    const plantName = name || (identification?.commonName !== "Unknown common name" ? identification.commonName : "New Plant");
    const plantSpecies = identification?.species || "Unknown species";

    const newPlant = await insertPlant(Number(userId), Number(roomId), plantName, identification?.commonName || null, plantSpecies, imageUrl);

    const diagnosisText = diagnosis?.diagnosis || "no disease";
    const diagnosisAccuracy = diagnosis?.accuracy !== undefined ? diagnosis.accuracy : 100.00;

    // Generar notas médicas/climáticas utilizando Gemini / Fallback
    const treatmentNotes = await generateTreatmentNotes({
      species: plantSpecies,
      diagnosis: diagnosisText,
      accuracy: diagnosisAccuracy,
      temperature: room?.temperature_level,
      isIndoors: room?.is_indoors
    });

    const newRecord = await insertHealthRecord(newPlant.id, diagnosisText, diagnosisAccuracy, treatmentNotes);

    const plantResponse = mapPlantRow(newPlant);
    plantResponse.common_name = identification?.commonName || newPlant.species;
    plantResponse.confidence_score = identification?.accuracy || 100.0;

    res.status(201).json({
      message: "Plant identified and scanned successfully",
      plant: plantResponse,
      initialDiagnosis: {
        diagnosis: newRecord.diagnosis,
        accuracy: newRecord.accuracy ? Number(newRecord.accuracy) : 100,
        treatmentNotes: newRecord.treatment_notes
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
    const [diagnosis, roomContext, plant] = await Promise.all([
      identifyDisease(imageUrl),
      getRoomContextByPlantId(plantId),
      getPlantById(plantId)
    ]);

    const diagnosisText = diagnosis?.diagnosis || "no disease";
    const diagnosisAccuracy = diagnosis?.accuracy !== undefined ? diagnosis.accuracy : 100.00;

    // Generar notas médicas/climáticas utilizando Gemini / Fallback
    const treatmentNotes = await generateTreatmentNotes({
      species: plant?.species || "Unknown species",
      diagnosis: diagnosisText,
      accuracy: diagnosisAccuracy,
      temperature: roomContext?.temperature_level,
      isIndoors: roomContext?.is_indoors
    });

    const newRecord = await insertHealthRecord(Number(plantId), diagnosisText, diagnosisAccuracy, treatmentNotes);

    res.status(201).json({
      message: "Disease diagnosis completed",
      healthRecord: {
        id: newRecord.id,
        plantId: newRecord.plant_id,
        diagnosis: newRecord.diagnosis,
        accuracy: newRecord.accuracy ? Number(newRecord.accuracy) : 100,
        treatmentNotes: newRecord.treatment_notes,
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
      treatmentNotes: row.treatment_notes,
      date: row.date
    }));

    res.json({
      ...mapPlantRow(plantRow),
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
      plant: mapPlantRow(updatedPlant)
    });

  } catch (error) {
    console.error("Error en edit-plant:", error);
    res.sendStatus(500);
  }
});

// delete-plant(plantId)
endpointsPlantas.delete("/:plantId", async (req, res) => {
  const { plantId } = req.params;

  try {
    const deletedPlant = await deletePlant(plantId);
    if (!deletedPlant) {
      return res.status(404).json({ error: "Plant not found" });
    }
    res.json({
      message: "Plant deleted successfully",
      plantId: deletedPlant.id
    });
  } catch (error) {
    console.error("Error en delete-plant:", error);
    res.sendStatus(500);
  }
});

// edit-health-record(recordId)
endpointsPlantas.put("/records/:recordId", async (req, res) => {
  const { recordId } = req.params;
  const { treatmentNotes } = req.body;

  try {
    const updatedRecord = await updateHealthRecord(recordId, treatmentNotes);
    if (!updatedRecord) {
      return res.status(404).json({ error: "Health record not found" });
    }
    res.json({
      message: "Health record updated successfully",
      healthRecord: updatedRecord
    });
  } catch (error) {
    console.error("Error en edit-health-record:", error);
    res.sendStatus(500);
  }
});

// delete-health-record(recordId)
endpointsPlantas.delete("/records/:recordId", async (req, res) => {
  const { recordId } = req.params;

  try {
    const deletedRecord = await deleteHealthRecord(recordId);
    if (!deletedRecord) {
      return res.status(404).json({ error: "Health record not found" });
    }
    res.json({
      message: "Health record deleted successfully",
      recordId: deletedRecord.id
    });
  } catch (error) {
    console.error("Error en delete-health-record:", error);
    res.sendStatus(500);
  }
});
