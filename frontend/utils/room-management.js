import { createRoom } from "./rooms-api.js";
import { formatTemperatureForDb, parseTemperature } from "./format.js";

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
    errorMessage.hidden = true;

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

    if (!name) {
      errorMessage.textContent = "Ingresa un nombre para el ambiente";
      errorMessage.hidden = false;
      return;
    }

    if (
      rawTemperature === null ||
      rawTemperature === "" ||
      parsedTemp === null
    ) {
      errorMessage.textContent = "Ingresa una temperatura valida";
      errorMessage.hidden = false;
      return;
    }

    const temperatureLevel = formatTemperatureForDb(parsedTemp);

    try {
      await createRoom({
        userId,
        name,
        isIndoors,
        temperatureLevel,
      });

      closeModal();
      await onRoomCreated();
    } catch (error) {
      errorMessage.textContent =
        error.message ?? "No se pudo crear el ambiente";

      errorMessage.hidden = false;
    }
  });
}