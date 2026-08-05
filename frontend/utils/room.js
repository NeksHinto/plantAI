import { deleteRoom, fetchRooms, fetchPlantsByRoom, updateRoom, } from "./rooms-api.js";
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

function setupRoomEdition(room) {
  const editButton = document.querySelector("#edit-room-button");
  const modal = document.querySelector("#edit-room-modal");
  const form = document.querySelector("#edit-room-form");
  const nameInput = document.querySelector("#edit-room-name");
  const locationInput = document.querySelector("#edit-room-location");
  const temperatureInput = document.querySelector("#edit-room-temperature");
  const cancelButton = document.querySelector("#cancel-edit-room");
  const errorMessage = document.querySelector("#edit-room-error");

  if (!editButton || !modal || !form || !nameInput || !locationInput || !temperatureInput) {
    return;
  }

  function openModal() {
    nameInput.value = room.name;
    locationInput.value = String(room.isIndoors);
    temperatureInput.value = Number(room.temperatureLevel.replace("°C", "")) ?? "";

    console.log(temperatureInput.value);

    if (room.isIndoors === true) {

    }

    console.log(room.temperatureLevel);

    errorMessage.hidden = true;
    modal.hidden = false;
    nameInput.focus();
  }

  function closeModal() {
    modal.hidden = true;
  }

  editButton.addEventListener("click", openModal);
  cancelButton?.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const isIndoors = locationInput.value === "true";
    const temperatureValue = temperatureInput.value;
    const temperatureLevel = Number(temperatureValue);

    if (!name) {
      errorMessage.textContent = "Ingresa un nombre para el ambiente";
      errorMessage.hidden = false;
      return;
    }
    if (temperatureValue === "" || Number.isNaN(temperatureLevel)) {
      errorMessage.textContent = "Ingresa una temperatura valida";
      errorMessage.hidden = false;
      return;
    }

    try {
      await updateRoom(room.id, { name, isIndoors, temperatureLevel, });

      room.name = name;
      room.isIndoors = isIndoors;
      room.temperatureLevel = temperatureLevel;
      closeModal();

      const title = document.querySelector(".room-expanded__title");

      if (title) {
        title.textContent = name;
      }

      document.title = `${name} | PlantAI`;
    } catch (error) {
      errorMessage.textContent =
        error.message ?? "No se pudo editar el ambiente";

      errorMessage.hidden = false;
    }
  });
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

    setupRoomEdition(activeRoom);
    setupRoomDeletion(activeRoom.id);

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
