// plantas.js
import { Router } from "express";
import { identifySpecies, identifyDisease } from "../services/externalServices.js";
import {
  getPlantById,
  getHealthRecordsByPlantId,
  updatePlant,
  insertPlant,
  insertHealthRecord,
  getRoomContextByPlantId,
  deletePlant,
  deleteHealthRecord,
  updateHealthRecord,
  getRoomById,
} from "../db/dataAccess.js";
import { generateTreatmentNotes } from "../services/treatmentRecommendation.js";
import { mapPlantRow } from "../services/mappers.js";

export const endpointsPlantas = Router();

// analyze-scan: Analiza la imagen (especie y/o enfermedad) SIN guardar nada en la base de datos
endpointsPlantas.post("/analyze-scan", async (req, res) => {
  const { imageUrl, roomId, plantId } = req.body;

  if (!imageUrl || (!roomId && !plantId)) {
    return res.status(400).json({ error: "Faltan datos obligatorios (imageUrl y roomId o plantId)" });
  }

  try {
    if (roomId) {
      const [identification, diagnosis, room] = await Promise.all([
        identifySpecies(imageUrl),
        identifyDisease(imageUrl),
        getRoomById(roomId)
      ]);

      const speciesAccuracy = identification?.accuracy ?? 0;

      if (identification?.notFound || speciesAccuracy < 5) {
        return res.status(422).json({
          error: "SPECIES_NOT_FOUND",
          message: "No se pudo identificar la especie de la planta (coincidencia menor al 5%). Intente tomar otra foto más nítida o centrada en la planta."
        });
      }

      const plantSpecies = identification?.species || "Especie desconocida";
      const diagnosisText = diagnosis?.diagnosis || "Sin enfermedad";
      const diagnosisAccuracy = diagnosis?.accuracy ?? 0;

      const treatmentNotes = await generateTreatmentNotes({
        species: plantSpecies,
        diagnosis: diagnosisText,
        accuracy: diagnosisAccuracy,
        temperature: room?.temperature_level,
        isIndoors: room?.is_indoors
      });

      return res.json({
        identification: {
          species: plantSpecies,
          commonName: identification?.commonName || plantSpecies,
          accuracy: speciesAccuracy
        },
        diagnosis: {
          diagnosis: diagnosisText,
          accuracy: diagnosisAccuracy,
          treatmentNotes
        }
      });
    } else {
      const [diagnosis, roomContext, plant] = await Promise.all([
        identifyDisease(imageUrl),
        getRoomContextByPlantId(plantId),
        getPlantById(plantId)
      ]);

      const diagnosisText = diagnosis?.diagnosis || "Sin enfermedad";
      const diagnosisAccuracy = diagnosis?.accuracy ?? 0;

      const treatmentNotes = await generateTreatmentNotes({
        species: plant?.species || "Especie desconocida",
        diagnosis: diagnosisText,
        accuracy: diagnosisAccuracy,
        temperature: roomContext?.temperature_level,
        isIndoors: roomContext?.is_indoors
      });

      return res.json({
        identification: null,
        diagnosis: {
          diagnosis: diagnosisText,
          accuracy: diagnosisAccuracy,
          treatmentNotes
        }
      });
    }
  } catch (error) {
    console.error("Error en analyze-scan:", error);
    res.sendStatus(500);
  }
});

// add-plant(image): crea la planta y su registro diagnostico inicial en la base de datos.
endpointsPlantas.post("/add-plant", async (req, res) => {
  const { imageUrl, userId, roomId, name, species, commonName, diagnosis: reqDiagnosis, diagnosisAccuracy: reqAccuracy, treatmentNotes: reqNotes, confidenceScore } = req.body;

  if (!imageUrl || !userId || !roomId) {
    return res.status(400).json({ error: "Faltan datos obligatorios (imageUrl, userId, roomId)" });
  }

  try {
    let plantSpecies = species;
    let plantCommonName = commonName;
    let speciesAccuracy = confidenceScore;
    let diagnosisText = reqDiagnosis;
    let diagnosisAccuracy = reqAccuracy;
    let treatmentNotes = reqNotes;

    // Si los datos no vienen precargados del análisis previa, los calculamos
    if (!plantSpecies || diagnosisText === undefined) {
      const [identification, diagnosis, room] = await Promise.all([
        identifySpecies(imageUrl),
        identifyDisease(imageUrl),
        getRoomById(roomId)
      ]);

      speciesAccuracy = identification?.accuracy ?? 0;

      if (identification?.notFound || speciesAccuracy < 5) {
        return res.status(422).json({
          error: "SPECIES_NOT_FOUND",
          message: "No se pudo identificar la especie de la planta (coincidencia menor al 5%). Intente tomar otra foto más nítida o centrada en la planta."
        });
      }

      plantCommonName = identification?.commonName || null;
      plantSpecies = identification?.species || "Especie desconocida";
      diagnosisText = diagnosis?.diagnosis || "Sin enfermedad";
      diagnosisAccuracy = diagnosis?.accuracy ?? 0;

      treatmentNotes = await generateTreatmentNotes({
        species: plantSpecies,
        diagnosis: diagnosisText,
        accuracy: diagnosisAccuracy,
        temperature: room?.temperature_level,
        isIndoors: room?.is_indoors
      });
    }

    const plantName = name || (plantCommonName && plantCommonName !== "Nombre comun desconocido" ? plantCommonName : "Nueva planta");

    const newPlant = await insertPlant(Number(userId), Number(roomId), plantName, plantCommonName, plantSpecies, imageUrl);
    const newRecord = await insertHealthRecord(newPlant.id, diagnosisText || "Sin enfermedad", diagnosisAccuracy ?? 0, treatmentNotes || "");

    const plantResponse = mapPlantRow(newPlant);
    plantResponse.common_name = plantCommonName || newPlant.species;
    plantResponse.confidence_score = speciesAccuracy ?? 100.0;

    res.status(201).json({
      message: "Planta identificada y escaneada correctamente",
      plant: plantResponse,
      initialDiagnosis: {
        diagnosis: newRecord.diagnosis,
        accuracy: newRecord.accuracy !== undefined && newRecord.accuracy !== null ? Number(newRecord.accuracy) : 0,
        treatmentNotes: newRecord.treatment_notes
      }
    });

  } catch (error) {
    console.error("Error en add-plant:", error);
    res.sendStatus(500);
  }
});

// identify-disease(image): Realiza y devuelve diagnostico guardandolo en la base de datos.
endpointsPlantas.post("/identify-disease", async (req, res) => {
  const { imageUrl, plantId, diagnosis: reqDiagnosis, diagnosisAccuracy: reqAccuracy, treatmentNotes: reqNotes } = req.body;

  if ((!imageUrl && !reqDiagnosis) || !plantId) {
    return res.status(400).json({ error: "Faltan datos requeridos (plantId y imageUrl o datos del diagnóstico)" });
  }

  try {
    let diagnosisText = reqDiagnosis;
    let diagnosisAccuracy = reqAccuracy;
    let treatmentNotes = reqNotes;

    if (!diagnosisText) {
      const [diagnosis, roomContext, plant] = await Promise.all([
        identifyDisease(imageUrl),
        getRoomContextByPlantId(plantId),
        getPlantById(plantId)
      ]);

      diagnosisText = diagnosis?.diagnosis || "Sin enfermedad";
      diagnosisAccuracy = diagnosis?.accuracy ?? 0;

      treatmentNotes = await generateTreatmentNotes({
        species: plant?.species || "Especie desconocida",
        diagnosis: diagnosisText,
        accuracy: diagnosisAccuracy,
        temperature: roomContext?.temperature_level,
        isIndoors: roomContext?.is_indoors
      });
    }

    const newRecord = await insertHealthRecord(Number(plantId), diagnosisText, diagnosisAccuracy ?? 0, treatmentNotes || "");

    res.status(201).json({
      message: "Diagnostico de la enfermedad completado",
      healthRecord: {
        id: newRecord.id,
        plantId: newRecord.plant_id,
        diagnosis: newRecord.diagnosis,
        accuracy: newRecord.accuracy !== undefined && newRecord.accuracy !== null ? Number(newRecord.accuracy) : 0,
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
      return res.status(404).json({ error: "Planta no encontrada" });
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
      return res.status(404).json({ error: "Planta no encontrada" });
    }

    res.json({
      message: "Planta actualizada correctamente",
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
      return res.status(404).json({ error: "Planta no encontrada" });
    }
    res.json({
      message: "Planta eliminada correctamente",
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
      return res.status(404).json({ error: "Registro de salud no encontrado" });
    }
    res.json({
      message: "Registro de salud actualizado correctamente",
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
      return res.status(404).json({ error: "Registro de salud no encontrado" });
    }
    res.json({
      message: "Registro de salud eliminado correctamente",
      recordId: deletedRecord.id
    });
  } catch (error) {
    console.error("Error en delete-health-record:", error);
    res.sendStatus(500);
  }
});
