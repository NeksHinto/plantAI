import { fetchPlantById, updatePlant, updateHealthRecord, deleteHealthRecord } from "./plants-api.js";
import { mapPlantDetailFromApi } from "./mappers.js";
import { formatDate } from "./format.js";
import {
  createBadge,
  getStatusLabel,
  setPlantHeaderBack,
  setPlantHeaderAction,
  showConfirmModal,
  showError,
  showLoading,
  refreshIcons,
} from "./ui.js";

let currentHistory = [];

function fillPlantHeader(plant) {
  const avatar = document.querySelector("[data-plant-avatar]");
  const name = document.querySelector("[data-plant-name]");
  const species = document.querySelector("[data-plant-species]");
  const scanBtn = document.querySelector("#scan-plant-btn");
  const info = document.querySelector("#plant-info");

  if (avatar) {
    avatar.src = plant.image;
    avatar.alt = plant.name;
  }
  if (name) name.textContent = plant.name;
  if (species) {
    species.textContent = plant.commonName && plant.commonName !== plant.species
      ? `${plant.commonName} (${plant.species})`
      : (plant.species || plant.commonName || "");
  }
  if (scanBtn) scanBtn.href = `scanner.html?plantId=${plant.id}`;

  if (info) {
    info.innerHTML = `
      <dl class="plant-info">
        <div><dt>Nombre</dt><dd>${plant.name}</dd></div>
        <div><dt>Nombre común</dt><dd>${plant.commonName || "—"}</dd></div>
        <div><dt>Especie</dt><dd>${plant.species || "—"}</dd></div>
        <div><dt>Ambiente</dt><dd>#${plant.roomId ?? "—"}</dd></div>
      </dl>
    `;
  }

  document.title = `${plant.name} | PlantAI`;
}

function createTimelinePoint(entry, index, onDelete, onUpdateNotes) {
  const point = document.createElement("li");
  point.className = "timeline__point";
  point.dataset.index = index;

  point.innerHTML = `
    <time class="timeline__date" datetime="${entry.date}">${formatDate(entry.date)}</time>
    <button class="timeline__dot timeline__dot--${entry.status}" type="button" aria-label="Ver escaneo del ${formatDate(entry.date)}"></button>
    <span class="timeline__label timeline__label--${entry.status}">${entry.label}</span>
    <span class="timeline__note">${entry.treatmentNotes || entry.diagnosis}</span>
    <div class="timeline__popup" role="dialog" aria-label="Detalles del escaneo">
      <div class="timeline__popup-header">
        <span class="timeline__popup-date"><strong>${formatDate(entry.date)}</strong> • ${entry.time}</span>
        <button class="timeline__popup-close" type="button" aria-label="Cerrar detalles">
          <i data-lucide="x" aria-hidden="true"></i>
        </button>
      </div>
      <div class="timeline__popup-badge"></div>
      <div class="timeline__popup-body">
        <img class="timeline__popup-image" src="${entry.image}" alt="Escaneo del ${formatDate(entry.date)}">
        <div class="timeline__popup-details">
          <div class="timeline__popup-field">
            <span class="timeline__popup-label">Resultado del escaneo</span>
            <p class="timeline__popup-val">${entry.diagnosis || entry.label}</p>
          </div>
          <div class="timeline__popup-field">
            <div class="timeline__popup-label-row">
              <span class="timeline__popup-label">Notas</span>
              <button class="timeline__action-btn timeline__action-btn--edit" type="button" title="Editar notas" aria-label="Editar notas">
                <i data-lucide="pencil" aria-hidden="true"></i>
              </button>
            </div>
            <p class="timeline__popup-val timeline__popup-notes-text">${entry.treatmentNotes || "Sin observaciones."}</p>
            <form class="timeline__edit-notes-form" style="display: none;">
              <textarea class="timeline__edit-notes-input" rows="2" placeholder="Escribir notas de cuidado...">${entry.treatmentNotes || ""}</textarea>
              <div class="timeline__edit-notes-buttons">
                <button class="btn btn--primary btn--sm timeline__save-notes-btn" type="submit">Guardar</button>
                <button class="btn btn--outline btn--sm timeline__cancel-notes-btn" type="button">Cancelar</button>
              </div>
            </form>
          </div>
          ${entry.accuracy ? `
          <div class="timeline__popup-field">
            <span class="timeline__popup-label">Confianza</span>
            <p class="timeline__popup-val">${Math.round(entry.accuracy)}%</p>
          </div>` : ""}
        </div>
      </div>
      <div class="timeline__popup-footer">
        <button class="timeline__delete-btn" type="button" title="Eliminar este escaneo">
          <i data-lucide="trash-2" aria-hidden="true"></i> Eliminar registro
        </button>
      </div>
    </div>
  `;

  const badgeWrapper = point.querySelector(".timeline__popup-badge");
  if (badgeWrapper) {
    badgeWrapper.append(createBadge(entry.status, getStatusLabel(entry.status)));
  }

  const deleteBtn = point.querySelector(".timeline__delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (onDelete) onDelete(entry.id);
    });
  }

  const editBtn = point.querySelector(".timeline__action-btn--edit");
  const notesText = point.querySelector(".timeline__popup-notes-text");
  const editForm = point.querySelector(".timeline__edit-notes-form");
  const cancelBtn = point.querySelector(".timeline__cancel-notes-btn");
  const textarea = point.querySelector(".timeline__edit-notes-input");

  if (editBtn && editForm && notesText) {
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      notesText.style.display = "none";
      editForm.style.display = "flex";
      textarea.focus();
    });

    if (cancelBtn) {
      cancelBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        editForm.style.display = "none";
        notesText.style.display = "block";
      });
    }

    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const newNotes = textarea.value.trim();
      if (onUpdateNotes) {
        await onUpdateNotes(entry.id, newNotes);
      }
    });
  }

  return point;
}

function createScanAlbumCard(entry, isSelected) {
  const card = document.createElement("article");
  card.className = "scan-album__card";
  if (isSelected) card.classList.add("is-selected");

  card.innerHTML = `
    <img class="scan-album__image" src="${entry.image}" alt="Escaneo ${formatDate(entry.date)}">
    <div class="scan-album__footer">
      <time datetime="${entry.date}">${formatDate(entry.date)}</time>
    </div>
  `;

  card.querySelector(".scan-album__footer").append(
    createBadge(entry.status, getStatusLabel(entry.status))
  );

  return card;
}

function renderTimeline(container, history, onDelete, onUpdateNotes) {
  container.replaceChildren();

  if (history.length === 0) {
    container.innerHTML = "<p>No hay registros clínicos todavía.</p>";
    return;
  }

  const track = document.createElement("ol");
  track.className = "timeline__track";
  history.forEach((entry, index) => track.append(createTimelinePoint(entry, index, onDelete, onUpdateNotes)));
  container.append(track);

  const points = Array.from(track.querySelectorAll(".timeline__point"));

  function closeAllPopups() {
    points.forEach((p) => p.classList.remove("is-open"));
  }

  points.forEach((point) => {
    const popup = point.querySelector(".timeline__popup");
    const closeBtn = point.querySelector(".timeline__popup-close");

    point.addEventListener("click", (e) => {
      if (popup && popup.contains(e.target)) {
        if (closeBtn && closeBtn.contains(e.target)) {
          e.stopPropagation();
          point.classList.remove("is-open");
        }
        return;
      }

      e.stopPropagation();
      const isOpen = point.classList.contains("is-open");
      closeAllPopups();
      if (!isOpen) {
        point.classList.add("is-open");
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) {
      closeAllPopups();
    }
  });

  setTimeout(refreshIcons, 0);
}

function renderScanAlbum(container, history) {
  container.replaceChildren();

  if (history.length === 0) return;

  const track = document.createElement("div");
  track.className = "scan-album__track";
  const selectedIndex = history.length - 1;

  history.forEach((entry, index) => {
    const card = createScanAlbumCard(entry, index === selectedIndex);

    card.addEventListener("click", () => {
      track.querySelectorAll(".scan-album__card").forEach((c) => c.classList.remove("is-selected"));
      card.classList.add("is-selected");

      const timelinePoints = document.querySelectorAll(".timeline__point");
      timelinePoints.forEach((p) => p.classList.remove("is-open"));
      if (timelinePoints[index]) {
        timelinePoints[index].classList.add("is-open");
        timelinePoints[index].scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });

    track.append(card);
  });

  container.append(track);
}

async function handleDeleteRecord(recordId) {
  const confirmed = await showConfirmModal({
    title: "¿Eliminar registro clínico?",
    message: "Esta acción no se puede deshacer. Se eliminará el escaneo y su diagnóstico del historial.",
    confirmText: "Sí, eliminar",
    cancelText: "Cancelar",
    isDanger: true,
  });

  if (!confirmed) return;

  try {
    await deleteHealthRecord(recordId);
    currentHistory = currentHistory.filter((entry) => String(entry.id) !== String(recordId));
    refreshHistoryViews();
  } catch (error) {
    alert("Error al eliminar el registro: " + (error.message ?? "Error desconocido"));
  }
}

async function handleUpdateRecordNotes(recordId, newNotes) {
  try {
    await updateHealthRecord(recordId, newNotes);
    const item = currentHistory.find((entry) => String(entry.id) === String(recordId));
    if (item) {
      item.treatmentNotes = newNotes;
    }
    refreshHistoryViews();
  } catch (error) {
    alert("Error al actualizar las notas: " + (error.message ?? "Error desconocido"));
  }
}

function refreshHistoryViews() {
  const timeline = document.querySelector("#timeline");
  const album = document.querySelector("#scan-album");
  if (timeline) renderTimeline(timeline, currentHistory, handleDeleteRecord, handleUpdateRecordNotes);
  if (album) renderScanAlbum(album, currentHistory);
}

function setupPlantEdition(plant) {
  const editButton = document.querySelector("#plant-header-action");
  const modal = document.querySelector("#edit-plant-modal");
  const form = document.querySelector("#edit-plant-form");
  const nameInput = document.querySelector("#edit-plant-name");
  const cancelButton = document.querySelector("#cancel-edit-plant");
  const errorMessage = document.querySelector("#edit-plant-error");

  if (!editButton || !modal || !form || !nameInput || !errorMessage) {
    return;
  }

  function openModal(event) {
    event.preventDefault();

    nameInput.value = plant.name;
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

    if (!name) {
      errorMessage.textContent = "Ingresa un nombre para la planta";
      errorMessage.hidden = false;
      return;
    }

    try {
      await updatePlant(plant.id, {
        name,
      });

      plant.name = name;

      fillPlantHeader(plant);
      closeModal();
    } catch (error) {
      errorMessage.textContent = error.message ?? "No se pudo editar la planta";

      errorMessage.hidden = false;
    }
  });
}

async function initPlantDetail() {
  const timeline = document.querySelector("#timeline");
  const album = document.querySelector("#scan-album");
  if (!timeline && !album) return;

  const plantId = new URLSearchParams(window.location.search).get("id");

  if (!plantId) {
    showError(timeline, "Falta el parámetro id de la planta.");
    return;
  }

  showLoading(timeline, "Cargando historial...");

  try {
    const rawPlant = await fetchPlantById(plantId);
    const plant = mapPlantDetailFromApi(rawPlant);

    currentHistory = plant.history;

    fillPlantHeader(plant);
    setPlantHeaderBack(`room.html?id=${plant.roomId}`);
    setPlantHeaderAction("Editar planta", "#");
    setupPlantEdition(plant);

    refreshHistoryViews();
  } catch (error) {
    showError(timeline, error.message ?? "Error al cargar la planta");
  }
}

async function initPlantHeaderOnly() {
  const params = new URLSearchParams(window.location.search);
  const plantId = params.get("id") || params.get("plantId");
  if (!plantId) return;

  try {
    const rawPlant = await fetchPlantById(plantId);
    const plant = mapPlantDetailFromApi(rawPlant);
    fillPlantHeader(plant);
    setPlantHeaderBack(`plant.html?id=${plant.id}`);
    setPlantHeaderAction("Ver historial", `plant.html?id=${plant.id}`);
  } catch {
    setPlantHeaderBack("dashboard.html");
    setPlantHeaderAction("Ver historial", "dashboard.html");
  }
}

function initPlant() {
  const timeline = document.querySelector("#timeline");

  if (timeline) {
    initPlantDetail();
  } else {
    initPlantHeaderOnly();
  }
}

document.addEventListener("components:loaded", () => {
  initPlant();
  refreshIcons();
});



