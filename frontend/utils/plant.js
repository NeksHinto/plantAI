import { fetchPlantById } from "./plants-api.js";
import { mapPlantDetailFromApi } from "./mappers.js";
import { formatDate } from "./format.js";
import {
  createBadge,
  getStatusLabel,
  setPlantHeaderBack,
  setPlantHeaderAction,
  showError,
  showLoading,
} from "./ui.js";

function fillPlantHeader(plant) {
  const avatar = document.querySelector("[data-plant-avatar]");
  const name = document.querySelector("[data-plant-name]");
  const species = document.querySelector("[data-plant-species]");
  const scanBtn = document.querySelector("#scan-plant-btn");

  if (avatar) {
    avatar.src = plant.image;
    avatar.alt = plant.nickname;
  }
  if (name) name.textContent = plant.nickname;
  if (species) species.textContent = plant.species;
  if (scanBtn) scanBtn.href = `scanner.html?plantId=${plant.id}`;

  document.title = `${plant.nickname} | PlantAI`;
}

function createTimelinePoint(entry) {
  const point = document.createElement("li");
  point.className = "timeline__point";

  point.innerHTML = `
    <time class="timeline__date" datetime="${entry.date}">${formatDate(entry.date)}</time>
    <button class="timeline__dot timeline__dot--${entry.status}" type="button" aria-label="Ver escaneo del ${formatDate(entry.date)}"></button>
    <span class="timeline__label">${entry.label}</span>
    <span class="timeline__note">${entry.note || entry.scanResult}</span>
    <div class="timeline__popup" role="tooltip">
      <div class="timeline__popup-header">
        <span>${formatDate(entry.date)} · ${entry.time}</span>
      </div>
      <img class="timeline__popup-image" src="${entry.image}" alt="Escaneo del ${formatDate(entry.date)}">
      <p class="timeline__popup-result"><strong>Resultado:</strong> ${entry.scanResult}</p>
      <p class="timeline__popup-notes"><strong>Confianza:</strong> ${Math.round(entry.accuracy ?? 0)}%</p>
    </div>
  `;

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

function renderTimeline(container, history) {
  container.replaceChildren();

  if (history.length === 0) {
    container.innerHTML = "<p>No hay registros clínicos todavía.</p>";
    return;
  }

  const track = document.createElement("ol");
  track.className = "timeline__track";
  history.forEach((entry) => track.append(createTimelinePoint(entry)));
  container.append(track);
}

function renderScanAlbum(container, history) {
  container.replaceChildren();

  if (history.length === 0) return;

  const track = document.createElement("div");
  track.className = "scan-album__track";
  const selectedIndex = history.length - 1;

  history.forEach((entry, index) => {
    track.append(createScanAlbumCard(entry, index === selectedIndex));
  });

  container.append(track);
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

    fillPlantHeader(plant);
    setPlantHeaderBack(`room.html?id=${plant.roomId}`);
    // TODO: implementar formulario de edición (PUT /plantas/:plantId)
    setPlantHeaderAction("Editar planta", "#");

    renderTimeline(timeline, plant.history);
    if (album) renderScanAlbum(album, plant.history);
  } catch (error) {
    showError(timeline, error.message ?? "Error al cargar la planta");
  }
}

async function initPlantHeaderOnly() {
  const plantId = new URLSearchParams(window.location.search).get("plantId");
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

document.addEventListener("components:loaded", initPlant);
