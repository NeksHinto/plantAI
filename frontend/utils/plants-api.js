import { apiRequest } from "./api.js";

export function fetchPlantById(plantId) {
  return apiRequest(`/plantas/${plantId}`);
}

// Multipart (File) preferred for PlantNet; JSON with imageUrl/imageBase64 as fallback.
export function analyzeScan({ imageUrl, imageFile, imageBase64, roomId, plantId }) {
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

export function deletePlant(plantId) {
  return apiRequest(`/plantas/${plantId}`, {
    method: "DELETE",
  });
}
