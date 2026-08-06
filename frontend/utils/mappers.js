import { HEALTH_STATUS, PLACEHOLDER_PLANT, PLACEHOLDER_ROOM } from "./constants.js";
import { formatTime, formatTemperatureForDb } from "./format.js";

const NO_DISEASE = ["no disease", "sin enfermedad", "no se detect"];

export function resolveImage(imageUrl, fallback) {
  if (!imageUrl || imageUrl === "dummy image") return fallback;
  return imageUrl;
}

export function resolvePlantImage(imageUrl) {
  return resolveImage(imageUrl, PLACEHOLDER_PLANT);
}

export function resolveRoomImage(room) {
  return resolveImage(room?.imageUrl, PLACEHOLDER_ROOM);
}

export function healthStatusFromRecord(record) {
  const diagnosis = (record?.diagnosis ?? "").toLowerCase();
  const accuracy = Number(record?.accuracy ?? 0);

  if (NO_DISEASE.some((p) => diagnosis.includes(p))) return HEALTH_STATUS.SALUDABLE;
  if (accuracy >= 50) return HEALTH_STATUS.CRITICO;
  if (accuracy >= 15) return HEALTH_STATUS.ATENCION;
  return HEALTH_STATUS.SALUDABLE;
}

export function healthStatusFromPercent(percent) {
  if (percent === 0) return HEALTH_STATUS.SALUDABLE;
  if (percent >= 40) return HEALTH_STATUS.CRITICO;
  return HEALTH_STATUS.ATENCION;
}

export function statusLabel(status) {
  return {
    [HEALTH_STATUS.SALUDABLE]: "Saludable",
    [HEALTH_STATUS.ATENCION]: "Atención",
    [HEALTH_STATUS.CRITICO]: "Crítico",
  }[status] ?? status;
}

export function mapPlantFromApi(plant, roomName = "") {
  return {
    id: plant.id,
    userId: plant.userId,
    roomId: plant.roomId,
    name: plant.name,
    commonName: plant.common_name,
    species: plant.species,
    image: resolveImage(plant.imageUrl, PLACEHOLDER_PLANT),
    roomName,
    status: plant.status ?? HEALTH_STATUS.SALUDABLE,
  };
}

export function mapRoomFromApi(room, plants = []) {
  const unhealthy = plants.filter((p) => p.status !== HEALTH_STATUS.SALUDABLE).length;
  const badStatePercent = plants.length
    ? Math.round((unhealthy / plants.length) * 100)
    : 0;

  const formattedTemp = formatTemperatureForDb(room.temperatureLevel);

  return {
    id: room.id,
    userId: room.userId,
    name: room.name,
    image: resolveImage(room.imageUrl, PLACEHOLDER_ROOM),
    temperatureLevel: formattedTemp || room.temperatureLevel,
    isIndoors: room.isIndoors,
    plantCount: plants.length,
    badStatePercent,
    status: healthStatusFromPercent(badStatePercent),
    plants,
  };
}

export function mapPlantDetailFromApi(plant) {
  const image = resolveImage(plant.imageUrl, PLACEHOLDER_PLANT);
  const history = (plant.healthRecords ?? [])
    .map((record) => ({
      id: record.id,
      plantId: record.plantId,
      diagnosis: record.diagnosis,
      accuracy: record.accuracy,
      treatmentNotes: record.treatmentNotes ?? "",
      date: record.date,
      time: formatTime(record.date),
      status: healthStatusFromRecord(record),
      label: statusLabel(healthStatusFromRecord(record)),
      image,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return {
    id: plant.id,
    userId: plant.userId,
    roomId: plant.roomId,
    name: plant.name,
    commonName: plant.common_name,
    species: plant.species,
    image,
    history,
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

  const diagnosisAccuracy = diagnosis?.accuracy !== undefined && diagnosis?.accuracy !== null
    ? Math.round(Number(diagnosis.accuracy))
    : 0;

  const isDiagnosisLowConfidence = diagnosisAccuracy < 15;

  return {
    species,
    commonName: identification?.commonName,
    matchPercent,
    isSpeciesLowConfidence: hasIdentification && matchPercent < 15,
    isDiagnosisLowConfidence,
    isUnidentified: hasIdentification && (species === "Especie desconocida" || matchPercent < 5),
    healthStatus,
    healthLabel: diagnosis?.diagnosis ?? "Sin diagnóstico",
    recommendation: diagnosis?.treatmentNotes ?? "Sin notas de tratamiento.",
    image: imageUrl,
    scannedAt: scannedAt ?? new Date().toISOString(),
    diagnosisAccuracy,
  };
}
