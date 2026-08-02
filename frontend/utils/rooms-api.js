import { apiRequest } from "./api.js";

export function fetchRooms(userId) {
  return apiRequest(`/rooms?userId=${userId}`);
}

export function fetchPlantsByRoom(roomId) {
  return apiRequest(`/rooms/${roomId}/plants`);
}

export function createRoom(fields) {
  return apiRequest("/rooms", {
    method: "POST",
    body: JSON.stringify(fields),
  });
}

// TODO: conectar UI de edición de ambiente cuando exista el formulario
export function updateRoom(roomId, fields) {
  return apiRequest(`/rooms/${roomId}`, {
    method: "PUT",
    body: JSON.stringify(fields),
  });
}

export function deleteRoom(roomId) {
  return apiRequest(`/rooms/${roomId}`, {
    method: "DELETE",
  });
}