import { apiRequest } from "./api.js";

// Solicita los detalles de una planta a la API
export function fetchPlantById(plantId) {
  return apiRequest(`/plantas/${plantId}`);
}

// Envía la foto para analizar especie y enfermedad
export function analyzeScan({ imageUrl, imageFile, roomId, plantId }) {
  if (imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);
    if (roomId) formData.append("roomId", roomId);
    if (plantId) formData.append("plantId", plantId);

    return apiRequest("/plantas/analyze-scan", {
      method: "POST",
      body: formData,
    });
  }

  return apiRequest("/plantas/analyze-scan", {
    method: "POST",
    body: JSON.stringify({ imageUrl, imageBase64, roomId, plantId }),
  });
}

// Registra una nueva planta analizada en la API
export function addPlant(data) {
  return apiRequest("/plantas/add-plant", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Envía un nuevo escaneo de enfermedad para una planta existente
export function identifyDisease(data) {
  return apiRequest("/plantas/identify-disease", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Actualiza los datos de una planta
export function updatePlant(plantId, fields) {
  return apiRequest(`/plantas/${plantId}`, {
    method: "PUT",
    body: JSON.stringify(fields),
  });
}

// Actualiza las notas de tratamiento de un escaneo
export function updateHealthRecord(recordId, treatmentNotes) {
  return apiRequest(`/plantas/records/${recordId}`, {
    method: "PUT",
    body: JSON.stringify({ treatmentNotes }),
  });
}

// Elimina un escaneo del historial clínico
export function deleteHealthRecord(recordId) {
  return apiRequest(`/plantas/records/${recordId}`, {
    method: "DELETE",
  });
}

// Elimina una planta
export function deletePlant(plantId) {
  return apiRequest(`/plantas/${plantId}`, {
    method: "DELETE",
  });
}
