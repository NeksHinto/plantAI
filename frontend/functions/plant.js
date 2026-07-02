import { MOCK_PLANT_DETAIL, MOCK_USER, formatDate } from "./mock-data.js";
import { createBadge, getStatusLabel, setPlantHeaderBack, setPlantHeaderAction } from "./ui.js";

function fillPlantHeader(plant) {
  const avatar = document.querySelector("[data-plant-avatar]");
  const name = document.querySelector("[data-plant-name]");
  const species = document.querySelector("[data-plant-species]");

  if (avatar) {
    avatar.src = plant.image;
    avatar.alt = plant.nickname;
  }
  if (name) name.textContent = plant.nickname;
  if (species) species.textContent = plant.species;

  document.title = `${plant.nickname} | PlantAI`;
}

function createTimelinePoint(entry) {
  const point = document.createElement("li");
  point.className = "timeline__point";

  point.innerHTML = `
    <time class="timeline__date" datetime="${entry.date}">${formatDate(entry.date)}</time>
    <button class="timeline__dot timeline__dot--${entry.status}" type="button" aria-label="Ver escaneo del ${formatDate(entry.date)}"></button>
    <span class="timeline__label">${entry.label}</span>
    <span class="timeline__note">${entry.note}</span>
    <div class="timeline__popup" role="tooltip">
      <div class="timeline__popup-header">
        <span>${formatDate(entry.date)} · ${entry.time}</span>
      </div>
      <img class="timeline__popup-image" src="${entry.image}" alt="Escaneo del ${formatDate(entry.date)}">
      <p class="timeline__popup-result"><strong>Resultado:</strong> ${entry.scanResult}</p>
      <p class="timeline__popup-notes"><strong>Notas:</strong> ${entry.note}</p>
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
  const track = document.createElement("ol");
  track.className = "timeline__track";
  history.forEach((entry) => track.append(createTimelinePoint(entry)));
  container.append(track);
}

function renderScanAlbum(container, history) {
  const track = document.createElement("div");
  track.className = "scan-album__track";
  history.forEach((entry, index) => {
    track.append(createScanAlbumCard(entry, index === 2));
  });
  container.append(track);
}

function initPlant() {
  const plant = MOCK_PLANT_DETAIL;
  fillPlantHeader(plant);

  const timeline = document.querySelector("#timeline");
  const album = document.querySelector("#scan-album");

  if (timeline) {
    setPlantHeaderBack(`room.html?id=${plant.roomId}`);
    setPlantHeaderAction("Editar planta", "#");
    renderTimeline(timeline, plant.history);
  }

  if (album) renderScanAlbum(album, plant.history);

  if (!timeline && !album) {
    setPlantHeaderBack("plant.html");
    setPlantHeaderAction("Ver historial", "plant.html");
  }
}

document.addEventListener("components:loaded", initPlant);
