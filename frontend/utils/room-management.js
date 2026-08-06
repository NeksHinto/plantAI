import { createRoom, updateRoom, deleteRoom } from "./rooms-api.js";
import { parseTemperature } from "./format.js";

// Maneja el formulario para crear un ambiente
export function setupRoomCreation(userId, onRoomCreated) {
  const openButton = document.querySelector("#add-room-button");
  const modal = document.querySelector("#room-modal");
  const form = document.querySelector("#room-form");
  const cancelButton = document.querySelector("#cancel-room-button");
  const errorMessage = document.querySelector("#room-form-error");

  if (!openButton || !modal || !form) {
    return;
  }

  function openModal() {
    modal.hidden = false;
    form.reset();
    if (errorMessage) errorMessage.hidden = true;

    document.querySelector("#room-name")?.focus();
  }

  function closeModal() {
    modal.hidden = true;
  }

  openButton.addEventListener("click", openModal);
  cancelButton?.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    const name = formData.get("name")?.trim();
    const isIndoors = formData.get("isIndoors") === "true";
    const rawTemperature = formData.get("temperatureLevel");
    const parsedTemp = parseTemperature(rawTemperature);
    const humidityLevel = formData.get("humidityLevel") || "media";
    const lightLevel = formData.get("lightLevel") || "media";

    if (!name) {
      if (errorMessage) {
        errorMessage.textContent = "Ingresa un nombre para el ambiente";
        errorMessage.hidden = false;
      }
      return;
    }

    if (
      rawTemperature === null ||
      rawTemperature === "" ||
      parsedTemp === null
    ) {
      if (errorMessage) {
        errorMessage.textContent = "Ingresa una temperatura valida";
        errorMessage.hidden = false;
      }
      return;
    }

    const temperatureLevel = parsedTemp;

    try {
      await createRoom({
        userId,
        name,
        isIndoors,
        temperatureLevel,
        humidityLevel,
        lightLevel,
      });

      closeModal();
      await onRoomCreated();
    } catch (error) {
      if (errorMessage) {
        errorMessage.textContent =
          error.message ?? "No se pudo crear el ambiente";
        errorMessage.hidden = false;
      }
    }
  });
}

// Maneja el formulario para editar un ambiente
export function setupRoomEdition(onRoomUpdated) {
  const modal = document.querySelector("#edit-room-modal");
  const form = document.querySelector("#edit-room-form");
  const nameInput = document.querySelector("#edit-room-name");
  const locationInput = document.querySelector("#edit-room-location");
  const temperatureInput = document.querySelector("#edit-room-temperature");
  const humidityInput = document.querySelector("#edit-room-humidity");
  const lightInput = document.querySelector("#edit-room-light");
  const cancelButton = document.querySelector("#cancel-edit-room");
  const errorMessage = document.querySelector("#edit-room-error");

  let currentRoom = null;

  if (!modal || !form || !nameInput || !locationInput || !temperatureInput) {
    return () => {};
  }

  function openEditModal(room) {
    currentRoom = room;
    nameInput.value = room.name;
    locationInput.value = String(room.isIndoors);

    const parsedTemp = parseTemperature(room.temperatureLevel);
    temperatureInput.value = parsedTemp !== null ? parsedTemp : "";
    if (humidityInput) humidityInput.value = room.humidityLevel || "media";
    if (lightInput) lightInput.value = room.lightLevel || "media";

    if (errorMessage) errorMessage.hidden = true;
    modal.hidden = false;
    nameInput.focus();
  }

  function closeModal() {
    modal.hidden = true;
    currentRoom = null;
  }

  cancelButton?.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!currentRoom) return;

    const name = nameInput.value.trim();
    const isIndoors = locationInput.value === "true";
    const rawTemperature = temperatureInput.value;
    const parsedTemp = parseTemperature(rawTemperature);
    const humidityLevel = humidityInput?.value || "media";
    const lightLevel = lightInput?.value || "media";

    if (!name) {
      if (errorMessage) {
        errorMessage.textContent = "Ingresa un nombre para el ambiente";
        errorMessage.hidden = false;
      }
      return;
    }
    if (rawTemperature === "" || parsedTemp === null) {
      if (errorMessage) {
        errorMessage.textContent = "Ingresa una temperatura valida";
        errorMessage.hidden = false;
      }
      return;
    }

    const temperatureLevel = parsedTemp;

    try {
      await updateRoom(currentRoom.id, {
        name,
        isIndoors,
        temperatureLevel,
        humidityLevel,
        lightLevel,
      });
      closeModal();
      await onRoomUpdated();
    } catch (error) {
      if (errorMessage) {
        errorMessage.textContent =
          error.message ?? "No se pudo editar el ambiente";
        errorMessage.hidden = false;
      }
    }
  });

  return openEditModal;
}

// Maneja la confirmación para eliminar un ambiente
export function setupRoomDeletion(onRoomDeleted) {
  const modal = document.querySelector("#delete-room-modal");
  const cancelButton = document.querySelector("#cancel-delete-room");
  const confirmButton = document.querySelector("#confirm-delete-room");
  const errorMessage = document.querySelector("#delete-room-error");

  let currentRoom = null;

  if (!modal || !confirmButton) {
    return () => {};
  }

  function openDeleteModal(room) {
    currentRoom = room;
    modal.hidden = false;
    if (errorMessage) errorMessage.hidden = true;
  }

  function closeModal() {
    modal.hidden = true;
    currentRoom = null;
  }

  cancelButton?.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  confirmButton.addEventListener("click", async () => {
    if (!currentRoom) return;

    confirmButton.disabled = true;
    confirmButton.textContent = "Eliminando...";

    try {
      await deleteRoom(currentRoom.id);
      closeModal();
      await onRoomDeleted();
    } catch (error) {
      if (errorMessage) {
        errorMessage.textContent =
          error.message ?? "No se pudo eliminar el ambiente";
        errorMessage.hidden = false;
      }
    } finally {
      confirmButton.disabled = false;
      confirmButton.textContent = "Eliminar ambiente";
    }
  });

  return openDeleteModal;
}