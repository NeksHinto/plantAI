import {
  HEALTH_STATUS,
  PLACEHOLDER_PLANT,
  PLACEHOLDER_ROOM_INDOOR,
  PLACEHOLDER_ROOM_OUTDOOR,
} from "./constants.js";
import { formatDate, formatTime } from "./format.js";

const NO_DISEASE_PATTERNS = [
  "no disease",
  "sin enfermedad",
  "no se detect",
];

export function resolvePlantImage(imageUrl) {
  if (!imageUrl || imageUrl === "dummy image") return PLACEHOLDER_PLANT;
  return imageUrl;
}

export function resolveRoomImage(room) {
  if (room.imageUrl && room.imageUrl !== "dummy image") return room.imageUrl;
  return room.isIndoors ? PLACEHOLDER_ROOM_INDOOR : PLACEHOLDER_ROOM_OUTDOOR;
}

export function healthStatusFromRecord(record) {
  const diagnosis = (record?.diagnosis ?? "").toLowerCase();
  const accuracy = Number(record?.accuracy ?? 0);

  const isHealthy = NO_DISEASE_PATTERNS.some((pattern) => diagnosis.includes(pattern));
  if (isHealthy || accuracy >= 85) return HEALTH_STATUS.SALUDABLE;
  if (accuracy < 50) return HEALTH_STATUS.CRITICO;
  return HEALTH_STATUS.ATENCION;
}

export function healthStatusFromPercent(percent) {
  if (percent === 0) return HEALTH_STATUS.SALUDABLE;
  if (percent >= 40) return HEALTH_STATUS.CRITICO;
  return HEALTH_STATUS.ATENCION;
}

export function mapPlantFromApi(plant, roomName = "") {
  // TODO: el backend debería incluir el último estado de salud en el listado de plantas
  const status = plant.status ?? HEALTH_STATUS.SALUDABLE;

  return {
    id: plant.id,
    name: plant.name,
    roomId: plant.roomId,
    roomName: roomName || plant.roomName || "",
    species: plant.species,
    speciesClass: plant.species_class,
    commonName: plant.commonName ?? plant.common_name,
    image: resolvePlantImage(plant.imageUrl),
    confidenceScore: plant.confidence_score,
    status,
  };
}

export function mapRoomFromApi(room, plants = []) {
  const unhealthyCount = plants.filter(
    (plant) => plant.status !== HEALTH_STATUS.SALUDABLE
  ).length;
  const badStatePercent = plants.length
    ? Math.round((unhealthyCount / plants.length) * 100)
    : 0;

  return {
    id: room.id,
    name: room.name,
    isIndoors: room.isIndoors,
    lightExposure: room.lightExposure,
    image: resolveRoomImage(room),
    plantCount: plants.length,
    badStatePercent,
    status: healthStatusFromPercent(badStatePercent),
    plants,
  };
}

export function mapHealthRecordToTimelineEntry(record, plantImage) {
  const status = healthStatusFromRecord(record);
  const dateIso = new Date(record.date).toISOString();

  return {
    id: record.id,
    date: dateIso.split("T")[0],
    time: formatTime(record.date),
    status,
    label: statusLabel(status),
    treatmentNotes: record.treatmentNotes ?? "",
    scanResult: record.diagnosis ?? "Sin diagnóstico",
    image: plantImage,
    accuracy: record.accuracy,
  };
}

export function mapPlantDetailFromApi(plant) {
  const image = resolvePlantImage(plant.imageUrl);
  const history = (plant.healthRecords ?? [])
    .map((record) => mapHealthRecordToTimelineEntry(record, image))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return {
    id: plant.id,
    nickname: plant.name,
    species: plant.species,
    speciesClass: plant.species_class,
    commonName: plant.common_name,
    image,
    roomId: plant.roomId,
    confidenceScore: plant.confidence_score,
    history,
    latestStatus: history.length
      ? history[history.length - 1].status
      : HEALTH_STATUS.SALUDABLE,
  };
}

export function mapScanResultFromApi({ identification, diagnosis, imageUrl, scannedAt }) {
  const healthStatus = healthStatusFromRecord({
    diagnosis: diagnosis?.diagnosis,
    accuracy: diagnosis?.accuracy,
  });

  const hasIdentification = Boolean(identification);
  const matchPercent = Math.round(identification?.accuracy ?? 0);
  const species = identification?.species ?? "Especie desconocida";

  const diagnosisAccuracy = diagnosis?.accuracy !== undefined ? Math.round(diagnosis.accuracy) : null;
  const isDiagnosisLowConfidence = diagnosisAccuracy !== null && diagnosisAccuracy < 15;

  return {
    species,
    commonName: identification?.commonName,
    matchPercent,
    isSpeciesLowConfidence: hasIdentification && matchPercent < 15,
    isDiagnosisLowConfidence,
    isUnidentified: hasIdentification && (species === "Especie desconocida" || matchPercent < 5),
    healthStatus,
    healthLabel: diagnosis?.diagnosis ?? "Sin diagnóstico",
    recommendation: diagnosis?.treatmentNotes ?? buildRecommendation(diagnosis),
    image: imageUrl,
    scannedAt: scannedAt ?? new Date().toISOString(),
    diagnosisAccuracy,
  };
}

function statusLabel(status) {
  const labels = {
    [HEALTH_STATUS.SALUDABLE]: "Saludable",
    [HEALTH_STATUS.ATENCION]: "Atención",
    [HEALTH_STATUS.CRITICO]: "Crítico",
    [HEALTH_STATUS.MEJORANDO]: "Mejorando",
    [HEALTH_STATUS.SALUD_OPTIMA]: "Salud Óptima",
    [HEALTH_STATUS.ALERTA]: "Alerta",
  };
  return labels[status] ?? status;
}

function buildRecommendation(diagnosis) {
  if (!diagnosis?.diagnosis) {
    return "No se pudo determinar una recomendación.";
  }

  const isHealthy = NO_DISEASE_PATTERNS.some((pattern) =>
    diagnosis.diagnosis.toLowerCase().includes(pattern)
  );

  if (isHealthy) {
    return "La planta se encuentra en buen estado. Continuar con el cuidado habitual.";
  }

  // TODO: el backend no devuelve recomendaciones estructuradas desde PlantNet
  return "Revisar condiciones de riego, luz y humedad según el diagnóstico.";
}
