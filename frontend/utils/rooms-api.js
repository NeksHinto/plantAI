import { apiRequest } from "./api.js";

// Obtiene la lista de ambientes del usuario
export function fetchRooms(userId) {
  return apiRequest(`/rooms?userId=${userId}`);
}

// Obtiene las plantas de un ambiente
export function fetchPlantsByRoom(roomId) {
  return apiRequest(`/rooms/${roomId}/plants`);
}

// Crea un nuevo ambiente
export function createRoom(fields) {
  return apiRequest("/rooms", {
    method: "POST",
    body: JSON.stringify(fields),
  });
}

// Edita los datos de un ambiente
export function updateRoom(roomId, fields) {
  return apiRequest(`/rooms/${roomId}`, {
    method: "PUT",
    body: JSON.stringify(fields),
  });
}

// Elimina un ambiente
export function deleteRoom(roomId) {
  return apiRequest(`/rooms/${roomId}`, {
    method: "DELETE",
  });
}