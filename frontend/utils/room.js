import { deleteRoom, fetchRooms, fetchPlantsByRoom, } from "./rooms-api.js";
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

function setupRoomDeletion(roomId) {
  const deleteButton = document.querySelector("#delete-room-button");
  const modal = document.querySelector("#delete-room-modal");
  const cancelButton = document.querySelector("#cancel-delete-room");
  const confirmButton = document.querySelector("#confirm-delete-room");
  const errorMessage = document.querySelector("#delete-room-error");

  if (!deleteButton || !modal || !confirmButton) {
    return;
  }

  function openModal() {
    modal.hidden = false;

    if (errorMessage) {
      errorMessage.hidden = true;
    }
  }

  function closeModal() {
    modal.hidden = true;
  }

  deleteButton.addEventListener("click", openModal);
  cancelButton?.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  confirmButton.addEventListener("click", async () => {
    confirmButton.disabled = true;
    confirmButton.textContent = "Eliminando...";

    try {
      await deleteRoom(roomId);
      window.location.href = "dashboard.html";
    } catch (error) {
      if (errorMessage) {
        errorMessage.textContent =
          error.message ?? "No se pudo eliminar el ambiente";

        errorMessage.hidden = false;
      }

      confirmButton.disabled = false;
      confirmButton.textContent = "Eliminar ambiente";
    }
  });
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

  setupRoomDeletion(roomId);

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
