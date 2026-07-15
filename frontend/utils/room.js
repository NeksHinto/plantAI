import { fetchRooms, fetchPlantsByRoom } from "./rooms-api.js";
import { mapPlantFromApi, mapRoomFromApi } from "./mappers.js";
import { requireAuth } from "./session.js";
import {
  createExpandedRoom,
  createCollapsedRoom,
} from "./cards.js";
import { fillUserGreeting, showError, showLoading } from "./ui.js";

async function loadRoomPageData(userId, activeRoomId) {
  const rooms = await fetchRooms(userId);

  const roomsWithPlants = await Promise.all(
    rooms.map(async (room) => {
      const plants = await fetchPlantsByRoom(room.id);
      const mappedPlants = plants.map((plant) =>
        mapPlantFromApi(plant, room.name)
      );
      return mapRoomFromApi(room, mappedPlants);
    })
  );

  const activeRoom = roomsWithPlants.find(
    (room) => String(room.id) === String(activeRoomId)
  );

  return {
    activeRoom,
    otherRooms: roomsWithPlants.filter(
      (room) => String(room.id) !== String(activeRoomId)
    ),
  };
}

async function initRoom() {
  const session = requireAuth();
  if (!session) return;

  fillUserGreeting("[data-user-greeting]", session.nombre);

  const params = new URLSearchParams(window.location.search);
  const roomId = params.get("id");

  const expandedContainer = document.querySelector("#room-expanded");
  const collapsedContainer = document.querySelector("#rooms-collapsed");

  if (!roomId) {
    showError(expandedContainer, "Falta el parámetro id del ambiente.");
    return;
  }

  showLoading(expandedContainer, "Cargando ambiente...");

  try {
    const { activeRoom, otherRooms } = await loadRoomPageData(
      session.userId,
      roomId
    );

    if (!activeRoom) {
      showError(expandedContainer, "Ambiente no encontrado.");
      return;
    }

    expandedContainer.replaceChildren();
    expandedContainer.append(createExpandedRoom(activeRoom, activeRoom.plants));

    if (collapsedContainer) {
      collapsedContainer.replaceChildren();
      otherRooms.forEach((room) => {
        collapsedContainer.append(createCollapsedRoom(room));
      });
    }

    document.title = `${activeRoom.name} | PlantAI`;
  } catch (error) {
    showError(expandedContainer, error.message ?? "Error al cargar el ambiente");
  }
}

document.addEventListener("components:loaded", initRoom);
