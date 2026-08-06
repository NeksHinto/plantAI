import { Router } from "express";
import multer from "multer";
import { identifySpecies, identifyDisease } from "../services/externalServices.js";
import {
  getPlantById,
  getHealthRecordsByPlantId,
  countHealthRecordsByPlantId,
  updatePlant,
  updatePlantImageUrl,
  insertPlant,
  insertHealthRecord,
  getRoomContextByPlantId,
  deletePlant,
  deleteHealthRecord,
  updateHealthRecord,
  getRoomById,
  getHealthRecordById,
} from "../db/dataAccess.js";
import { generateTreatmentNotes } from "../services/treatmentRecommendation.js";
import { mapPlantRow } from "../services/mappers.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  uploadObject,
  resolveUpload,
  plantImagePath,
  healthImagePath,
  parseDataUrl,
} from "../services/storage.js";

const upload = multer({ storage: multer.memoryStorage() });

export const endpointsPlantas = Router();

endpointsPlantas.use(authenticateToken);

// Mapea un registro de la base de datos al formato del historial de salud.
function mapHealthRecord(row) {
  return {
    id: row.id,
    plantId: row.plant_id,
    diagnosis: row.diagnosis,
    accuracy:
      row.accuracy !== undefined && row.accuracy !== null ? Number(row.accuracy) : 0,
    treatmentNotes: row.treatment_notes,
    imageUrl: row.image_url || null,
    date: row.date,
  };
}

// Determina la extensión del archivo según su tipo.
function fileExt(file) {
  const mime = file?.mimetype || "";
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  return "jpg";
}

// Sube y persiste la imagen principal de la planta en el almacenamiento de Supabase.
async function persistPlantCover({ imageSource, file, username, userId, plantId, roomId }) {
  if (process.env.DB_PROVIDER !== "supabase") {
    if (file?.buffer) return null;
    return /^https?:\/\//i.test(imageSource || "") ? imageSource : null;
  }

  try {
    if (file?.buffer) {
      const path = plantImagePath(username, userId, plantId, roomId, fileExt(file));
      return await uploadObject(path, file.buffer, file.mimetype || "image/jpeg");
    }

    if (!imageSource) return null;
    const uploaded = await resolveUpload(
      imageSource,
      plantImagePath(username, userId, plantId, roomId)
    );
    return uploaded?.publicUrl ?? null;
  } catch (error) {
    console.warn(
      "Plant cover upload skipped (check PRIVATE_SUPABASE_BUCKET_API_KEY / Storage RLS):",
      error?.message || error
    );
    return null;
  }
}

// Sube y persiste la imagen asociada a un escaneo o diagnóstico de salud.
async function persistHealthImage({
  imageSource,
  file,
  username,
  userId,
  plantId,
  roomId,
  series,
}) {
  if (process.env.DB_PROVIDER !== "supabase") {
    if (file?.buffer) return null;
    return /^https?:\/\//i.test(imageSource || "") ? imageSource : null;
  }

  try {
    if (file?.buffer) {
      const path = healthImagePath(
        username,
        userId,
        plantId,
        roomId,
        series,
        fileExt(file)
      );
      return await uploadObject(path, file.buffer, file.mimetype || "image/jpeg");
    }

    if (!imageSource) return null;
    const uploaded = await resolveUpload(
      imageSource,
      healthImagePath(username, userId, plantId, roomId, series)
    );
    return uploaded?.publicUrl ?? null;
  } catch (error) {
    console.warn(
      "Health image upload skipped (check PRIVATE_SUPABASE_BUCKET_API_KEY / Storage RLS):",
      error?.message || error
    );
    return null;
  }
}

function resolveImageInput(req) {
  // Extrae la referencia de la imagen desde los archivos o el cuerpo de la petición.
  if (req.file) return req.file;
  if (req.body?.imageBase64) return req.body.imageBase64;
  if (req.body?.imageUrl) return req.body.imageUrl;
  return null;
}

function toPlantNetInput(imageInput, file) {
  // Prepara la entrada de la imagen en un formato compatible con los servicios de PlantNet.
  if (file?.buffer) return file;
  if (typeof imageInput === "string" && /^https?:\/\//i.test(imageInput)) {
    return imageInput;
  }
  if (typeof imageInput === "string") {
    const parsed = parseDataUrl(imageInput);
    if (parsed) {
      return {
        buffer: parsed.buffer,
        mimetype: parsed.mimeType,
        originalname: `scan.${parsed.ext}`,
      };
    }
  }
  return null;
}

endpointsPlantas.post("/analyze-scan", upload.single("image"), async (req, res) => {
  // Analiza la foto enviada para identificar la especie o diagnosticar enfermedades sin guardar la planta.
  const imageInput = resolveImageInput(req);
  const { roomId, plantId } = req.body;
  const userId = req.user.userId;

  if (!imageInput || (!roomId && !plantId)) {
    return res.status(400).json({
      error: "Faltan datos obligatorios (imagen/imageUrl y roomId o plantId)",
    });
  }

  try {
    const plantNetInput = toPlantNetInput(imageInput, req.file);
    if (!plantNetInput) {
      return res.status(400).json({
        error: "Formato de imagen inválido para analizar",
      });
    }

    if (roomId) {
      const room = await getRoomById(roomId);
      if (!room || Number(room.user_id) !== Number(userId)) {
        return res.status(404).json({ error: "Habitación no encontrada" });
      }

      const [identification, diagnosis] = await Promise.all([
        identifySpecies(plantNetInput),
        identifyDisease(plantNetInput),
      ]);

      const speciesAccuracy = identification?.accuracy ?? 0;

      if (identification?.notFound || speciesAccuracy < 5) {
        return res.status(422).json({
          error: "SPECIES_NOT_FOUND",
          message:
            "No se pudo identificar la especie de la planta (coincidencia menor al 5%). Intente tomar otra foto más nítida o centrada en la planta.",
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
        isIndoors: room?.is_indoors,
      });

      return res.json({
        identification: {
          species: plantSpecies,
          commonName: identification?.commonName || plantSpecies,
          accuracy: speciesAccuracy,
        },
        diagnosis: {
          diagnosis: diagnosisText,
          accuracy: diagnosisAccuracy,
          treatmentNotes,
        },
      });
    }

    const plant = await getPlantById(plantId);
    if (!plant || Number(plant.user_id) !== Number(userId)) {
      return res.status(404).json({ error: "Planta no encontrada" });
    }

    const [diagnosis, roomContext] = await Promise.all([
      identifyDisease(plantNetInput),
      getRoomContextByPlantId(plantId),
    ]);

    const diagnosisText = diagnosis?.diagnosis || "Sin enfermedad";
    const diagnosisAccuracy = diagnosis?.accuracy ?? 0;

    const treatmentNotes = await generateTreatmentNotes({
      species: plant?.species || "Especie desconocida",
      diagnosis: diagnosisText,
      accuracy: diagnosisAccuracy,
      temperature: roomContext?.temperature_level,
      isIndoors: roomContext?.is_indoors,
    });

    return res.json({
      identification: null,
      diagnosis: {
        diagnosis: diagnosisText,
        accuracy: diagnosisAccuracy,
        treatmentNotes,
      },
    });
  } catch (error) {
    console.error("Error en analyze-scan:", error);
    res.sendStatus(500);
  }
});

endpointsPlantas.post("/add-plant", upload.single("image"), async (req, res) => {
  // Registra una nueva planta en un ambiente y guarda su primer escaneo de salud.
  const {
    imageUrl,
    imageBase64,
    roomId,
    name,
    species,
    commonName,
    diagnosis: reqDiagnosis,
    diagnosisAccuracy: reqAccuracy,
    treatmentNotes: reqNotes,
    confidenceScore,
  } = req.body;
  const userId = req.user.userId;
  const username = req.user.username || "user";
  const imageSource = imageBase64 || imageUrl;

  if ((!imageSource && !req.file) || !roomId) {
    return res.status(400).json({
      error: "Faltan datos obligatorios (imagen/imageUrl, roomId)",
    });
  }

  try {
    const room = await getRoomById(roomId);
    if (!room || Number(room.user_id) !== Number(userId)) {
      return res.status(404).json({ error: "Habitación no encontrada" });
    }

    let plantSpecies = species;
    let plantCommonName = commonName;
    let speciesAccuracy = confidenceScore;
    let diagnosisText = reqDiagnosis;
    let diagnosisAccuracy = reqAccuracy;
    let treatmentNotes = reqNotes;

    if (!plantSpecies || diagnosisText === undefined) {
      const plantNetInput =
        req.file ||
        (imageSource && /^https?:\/\//i.test(imageSource) ? imageSource : null);
      if (!plantNetInput) {
        return res.status(400).json({
          error: "No se pudo analizar: se necesita imagen binaria o URL pública",
        });
      }

      const [identification, diagnosis] = await Promise.all([
        identifySpecies(plantNetInput),
        identifyDisease(plantNetInput),
      ]);

      speciesAccuracy = identification?.accuracy ?? 0;

      if (identification?.notFound || speciesAccuracy < 5) {
        return res.status(422).json({
          error: "SPECIES_NOT_FOUND",
          message:
            "No se pudo identificar la especie de la planta (coincidencia menor al 5%). Intente tomar otra foto más nítida o centrada en la planta.",
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
        isIndoors: room?.is_indoors,
      });
    }

    const plantName =
      name ||
      (plantCommonName && plantCommonName !== "Nombre comun desconocido"
        ? plantCommonName
        : "Nueva planta");

    let newPlant = await insertPlant(
      Number(userId),
      Number(roomId),
      plantName,
      plantCommonName,
      plantSpecies,
      null
    );

    const coverUrl = await persistPlantCover({
      imageSource,
      file: req.file,
      username,
      userId,
      plantId: newPlant.id,
      roomId: Number(roomId),
    });

    if (coverUrl) {
      newPlant =
        (await updatePlantImageUrl(newPlant.id, coverUrl)) || {
          ...newPlant,
          image_url: coverUrl,
        };
    } else if (imageUrl && /^https?:\/\//i.test(imageUrl)) {
      newPlant =
        (await updatePlantImageUrl(newPlant.id, imageUrl)) || {
          ...newPlant,
          image_url: imageUrl,
        };
    }

    const newRecord = await insertHealthRecord(
      newPlant.id,
      diagnosisText || "Sin enfermedad",
      diagnosisAccuracy ?? 0,
      treatmentNotes || "",
      newPlant.image_url || null
    );

    const plantResponse = mapPlantRow(newPlant);
    plantResponse.common_name = plantCommonName || newPlant.species;
    plantResponse.confidence_score = speciesAccuracy ?? 100.0;

    res.status(201).json({
      message: "Planta identificada y escaneada correctamente",
      plant: plantResponse,
      initialDiagnosis: {
        diagnosis: newRecord.diagnosis,
        accuracy:
          newRecord.accuracy !== undefined && newRecord.accuracy !== null
            ? Number(newRecord.accuracy)
            : 0,
        treatmentNotes: newRecord.treatment_notes,
        imageUrl: newRecord.image_url || null,
      },
    });
  } catch (error) {
    console.error("Error en add-plant:", error);
    res.sendStatus(500);
  }
});

endpointsPlantas.post("/identify-disease", upload.single("image"), async (req, res) => {
  // Diagnostica la salud de una planta existente y agrega un nuevo registro a su historial.
  const {
    imageUrl,
    imageBase64,
    plantId,
    diagnosis: reqDiagnosis,
    diagnosisAccuracy: reqAccuracy,
    treatmentNotes: reqNotes,
  } = req.body;
  const userId = req.user.userId;
  const username = req.user.username || "user";
  const imageSource = imageBase64 || imageUrl;

  if ((!imageSource && !req.file && !reqDiagnosis) || !plantId) {
    return res.status(400).json({
      error:
        "Faltan datos requeridos (plantId y imagen/imageUrl o datos del diagnóstico)",
    });
  }

  try {
    const plant = await getPlantById(plantId);
    if (!plant || Number(plant.user_id) !== Number(userId)) {
      return res.status(404).json({ error: "Planta no encontrada" });
    }

    let diagnosisText = reqDiagnosis;
    let diagnosisAccuracy = reqAccuracy;
    let treatmentNotes = reqNotes;

    if (!diagnosisText) {
      const plantNetInput =
        req.file ||
        (imageSource && /^https?:\/\//i.test(imageSource) ? imageSource : null);
      if (!plantNetInput) {
        return res.status(400).json({
          error: "No se pudo diagnosticar: se necesita imagen binaria o URL pública",
        });
      }

      const [diagnosis, roomContext] = await Promise.all([
        identifyDisease(plantNetInput),
        getRoomContextByPlantId(plantId),
      ]);

      diagnosisText = diagnosis?.diagnosis || "Sin enfermedad";
      diagnosisAccuracy = diagnosis?.accuracy ?? 0;

      treatmentNotes = await generateTreatmentNotes({
        species: plant?.species || "Especie desconocida",
        diagnosis: diagnosisText,
        accuracy: diagnosisAccuracy,
        temperature: roomContext?.temperature_level,
        isIndoors: roomContext?.is_indoors,
      });
    }

    const existingCount = await countHealthRecordsByPlantId(Number(plantId));
    const series = existingCount + 1;
    const roomId = plant.room_id;

    const healthUrl =
      imageSource || req.file
        ? await persistHealthImage({
          imageSource,
          file: req.file,
          username,
          userId,
          plantId: Number(plantId),
          roomId,
          series,
        })
        : null;

    const newRecord = await insertHealthRecord(
      Number(plantId),
      diagnosisText,
      diagnosisAccuracy ?? 0,
      treatmentNotes || "",
      healthUrl
    );

    res.status(201).json({
      message: "Diagnostico de la enfermedad completado",
      healthRecord: mapHealthRecord(newRecord),
    });
  } catch (error) {
    console.error("Error en identify-disease:", error);
    res.sendStatus(500);
  }
});

endpointsPlantas.get("/:plantId", async (req, res) => {
  // Obtiene el detalle de una planta junto con todo su historial clínico.
  const { plantId } = req.params;

  try {
    const plantRow = await getPlantById(plantId);

    if (!plantRow || Number(plantRow.user_id) !== Number(req.user.userId)) {
      return res.status(404).json({ error: "Planta no encontrada" });
    }

    const recordsRows = await getHealthRecordsByPlantId(plantId);

    res.json({
      ...mapPlantRow(plantRow),
      healthRecords: recordsRows.map(mapHealthRecord),
    });
  } catch (error) {
    console.error("Error en get-plant-by-id:", error);
    res.sendStatus(500);
  }
});

endpointsPlantas.put("/:plantId", async (req, res) => {
  // Actualiza el nombre o la ubicación en ambiente de una planta.
  const { plantId } = req.params;
  const { name, roomId } = req.body;

  try {
    const existingPlant = await getPlantById(plantId);
    if (!existingPlant || Number(existingPlant.user_id) !== Number(req.user.userId)) {
      return res.status(404).json({ error: "Planta no encontrada" });
    }

    if (roomId !== undefined) {
      const room = await getRoomById(roomId);
      if (!room || Number(room.user_id) !== Number(req.user.userId)) {
        return res.status(404).json({ error: "Habitación no encontrada" });
      }
    }

    const updatedPlant = await updatePlant(plantId, name, roomId);

    if (!updatedPlant) {
      return res.status(404).json({ error: "Planta no encontrada" });
    }

    res.json({
      message: "Planta actualizada correctamente",
      plant: mapPlantRow(updatedPlant),
    });
  } catch (error) {
    console.error("Error en edit-plant:", error);
    res.sendStatus(500);
  }
});

endpointsPlantas.delete("/:plantId", async (req, res) => {
  // Elimina la planta seleccionada y todos sus registros clínicos asociados.
  const { plantId } = req.params;

  try {
    const existingPlant = await getPlantById(plantId);
    if (!existingPlant || Number(existingPlant.user_id) !== Number(req.user.userId)) {
      return res.status(404).json({ error: "Planta no encontrada" });
    }

    const deletedPlant = await deletePlant(plantId);
    if (!deletedPlant) {
      return res.status(404).json({ error: "Planta no encontrada" });
    }
    res.json({
      message: "Planta eliminada correctamente",
      plantId: deletedPlant.id,
    });
  } catch (error) {
    console.error("Error en delete-plant:", error);
    res.sendStatus(500);
  }
});

endpointsPlantas.put("/records/:recordId", async (req, res) => {
  // Actualiza las observaciones del tratamiento en un registro de salud específico.
  const { recordId } = req.params;
  const { treatmentNotes } = req.body;

  try {
    const record = await getHealthRecordById(recordId);
    if (!record || Number(record.user_id) !== Number(req.user.userId)) {
      return res.status(404).json({ error: "Registro de salud no encontrado" });
    }

    const updatedRecord = await updateHealthRecord(recordId, treatmentNotes);
    if (!updatedRecord) {
      return res.status(404).json({ error: "Registro de salud no encontrado" });
    }
    res.json({
      message: "Registro de salud actualizado correctamente",
      healthRecord: mapHealthRecord(updatedRecord),
    });
  } catch (error) {
    console.error("Error en edit-health-record:", error);
    res.sendStatus(500);
  }
});

endpointsPlantas.delete("/records/:recordId", async (req, res) => {
  // Elimina un registro de salud individual del historial de una planta.
  const { recordId } = req.params;

  try {
    const record = await getHealthRecordById(recordId);
    if (!record || Number(record.user_id) !== Number(req.user.userId)) {
      return res.status(404).json({ error: "Registro de salud no encontrado" });
    }

    const deletedRecord = await deleteHealthRecord(recordId);
    if (!deletedRecord) {
      return res.status(404).json({ error: "Registro de salud no encontrado" });
    }
    res.json({
      message: "Registro de salud eliminado correctamente",
      recordId: deletedRecord.id,
    });
  } catch (error) {
    console.error("Error en delete-health-record:", error);
    res.sendStatus(500);
  }
});
