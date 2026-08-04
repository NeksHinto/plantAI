import { apiRequest } from "./api.js";

export function fetchPlantById(plantId) {
  return apiRequest(`/plantas/${plantId}`);
}

export function analyzeScan({ imageUrl, roomId, plantId }) {
  return apiRequest("/plantas/analyze-scan", {
    method: "POST",
    body: JSON.stringify({ imageUrl, roomId, plantId }),
  });
}

export function addPlant(data) {
  return apiRequest("/plantas/add-plant", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function identifyDisease(data) {
  return apiRequest("/plantas/identify-disease", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// TODO: conectar UI de edición de planta cuando exista el formulario
export function updatePlant(plantId, fields) {
  return apiRequest(`/plantas/${plantId}`, {
    method: "PUT",
    body: JSON.stringify(fields),
  });
}

export function updateHealthRecord(recordId, treatmentNotes) {
  return apiRequest(`/plantas/records/${recordId}`, {
    method: "PUT",
    body: JSON.stringify({ treatmentNotes }),
  });
}

export function deleteHealthRecord(recordId) {
  return apiRequest(`/plantas/records/${recordId}`, {
    method: "DELETE",
  });
}

