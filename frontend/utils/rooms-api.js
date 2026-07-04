import { apiRequest } from "./api.js";

export function fetchRooms(userId) {
  return apiRequest(`/rooms?userId=${userId}`);
}

export function fetchPlantsByRoom(roomId) {
  return apiRequest(`/rooms/${roomId}/plants`);
}

// TODO: conectar UI de edición de ambiente cuando exista el formulario
export function (roomId, fields) {
  return apiRequest(`/rooms/${roomId}`, {
    method: "PUT",
    body: JSON.stringify(fields),
  });
}
