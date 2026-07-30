import { apiRequest } from "./api.js";

export function fetchPlantById(plantId) {
  return apiRequest(`/plantas/${plantId}`);
}

export function addPlant({ imageUrl, userId, roomId, name }) {
  return apiRequest("/plantas/add-plant", {
    method: "POST",
    body: JSON.stringify({ imageUrl, userId, roomId, name }),
  });
}

export function identifyDisease({ imageUrl, plantId }) {
  return apiRequest("/plantas/identify-disease", {
    method: "POST",
    body: JSON.stringify({ imageUrl, plantId }),
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

