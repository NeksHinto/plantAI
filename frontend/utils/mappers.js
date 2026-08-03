import { HEALTH_STATUS, PLACEHOLDER_PLANT, PLACEHOLDER_ROOM } from "./constants.js";
import { formatTime } from "./format.js";

const NO_DISEASE = ["no disease", "sin enfermedad", "no se detect"];

export function resolveImage(url, fallback) {
  if (!url || url === "dummy image") return fallback;
  return url;
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

  return {
    id: room.id,
    userId: room.userId,
    name: room.name,
    image: resolveImage(room.imageUrl, PLACEHOLDER_ROOM),
    temperatureLevel: room.temperatureLevel,
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
      date: new Date(record.date).toISOString().split("T")[0],
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
  return {
    species: identification?.species ?? "Especie desconocida",
    commonName: identification?.commonName,
    matchPercent: Math.round(identification?.accuracy ?? 0),
    healthLabel: diagnosis?.diagnosis ?? "Sin diagnóstico",
    recommendation: diagnosis?.treatmentNotes ?? "Sin notas de tratamiento.",
    image: imageUrl,
    scannedAt: scannedAt ?? new Date().toISOString(),
    diagnosisAccuracy: diagnosis?.accuracy,
  };
}
