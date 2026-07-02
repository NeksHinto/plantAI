import { MOCK_ROOMS, MOCK_PLANTS, MOCK_USER } from "./mock-data.js";
import {
  createBadge,
  createPageSizeControl,
  createPagination,
  createSearchBar,
  getStatusLabel,
  fillUserGreeting,
} from "./ui.js";

function createRoomCard(room) {
  const link = document.createElement("a");
  link.className = "room-card";
  link.href = `room.html?id=${room.id}`;

  const statusClass = room.badStatePercent === 0
    ? "saludable"
    : room.badStatePercent >= 40
      ? "critico"
      : "atencion";

  link.innerHTML = `
    <img class="room-card__image" src="${room.image}" alt="${room.name}">
    <div class="room-card__body">
      <h3 class="room-card__title">${room.name}</h3>
      <p class="room-card__meta">${room.plantCount} plantas</p>
      <p class="room-card__status-text room-card__status-text--${statusClass}">
        ${room.badStatePercent}% en mal estado
      </p>
    </div>
    <span class="room-card__chevron" aria-hidden="true">›</span>
  `;

  const badge = createBadge(room.status, getStatusLabel(room.status));
  link.querySelector(".room-card__body").append(badge);

  return link;
}

function createPlantCard(plant) {
  const link = document.createElement("a");
  link.className = "plant-card";
  link.href = `plant.html?id=${plant.id}`;

  link.innerHTML = `
    <img class="plant-card__image" src="${plant.image}" alt="${plant.name}">
    <div class="plant-card__body">
      <h3 class="plant-card__name">${plant.name}</h3>
      <p class="plant-card__room">${plant.roomName}</p>
    </div>
  `;

  link.querySelector(".plant-card__body").append(
    createBadge(plant.status, getStatusLabel(plant.status))
  );

  return link;
}

function renderRoomCards(container, rooms) {
  container.replaceChildren();
  rooms.forEach((room) => container.append(createRoomCard(room)));
}

function renderPlantCards(container, plants) {
  container.replaceChildren();
  plants.forEach((plant) => container.append(createPlantCard(plant)));
}

function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-nav__btn");
  const panels = document.querySelectorAll(".tab-panel");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tab;

      tabButtons.forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.tab === target);
        btn.setAttribute("aria-selected", btn.dataset.tab === target);
      });

      panels.forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.tab === target);
      });
    });
  });
}

function applyRoomFilterFromUrl() {
  const roomId = new URLSearchParams(window.location.search).get("room");
  if (!roomId) return;

  const plantasTab = document.querySelector('[data-tab="plantas"]');
  if (plantasTab) plantasTab.click();

  const searchInput = document.querySelector("#plants-search");
  const room = MOCK_ROOMS.find((item) => item.id === roomId);
  if (searchInput && room) {
    searchInput.value = room.name;
    filterPlants(room.name);
  }
}

function filterPlants(query) {
  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? MOCK_PLANTS.filter(
        (plant) =>
          plant.name.toLowerCase().includes(normalized) ||
          plant.roomName.toLowerCase().includes(normalized)
      )
    : MOCK_PLANTS;

  const container = document.querySelector("#plants-grid");
  if (container) renderPlantCards(container, filtered);
}

function filterRooms(query) {
  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? MOCK_ROOMS.filter((room) => room.name.toLowerCase().includes(normalized))
    : MOCK_ROOMS;

  const container = document.querySelector("#rooms-grid");
  if (container) renderRoomCards(container, filtered);
}

function initDashboard() {
  fillUserGreeting("[data-user-greeting]", MOCK_USER.name);

  const roomsGrid = document.querySelector("#rooms-grid");
  const plantsGrid = document.querySelector("#plants-grid");
  const roomsSearchSlot = document.querySelector("#rooms-search");
  const roomsPageSizeSlot = document.querySelector("#rooms-page-size");
  const roomsPaginationSlot = document.querySelector("#rooms-pagination");
  const plantsPageSizeSlot = document.querySelector("#plants-page-size");
  const plantsPaginationSlot = document.querySelector("#plants-pagination");

  if (roomsSearchSlot) {
    const search = createSearchBar("Buscar ambientes...");
    roomsSearchSlot.append(search);
    search.querySelector("input").addEventListener("input", (event) => {
      filterRooms(event.target.value);
    });
  }

  if (roomsPageSizeSlot) roomsPageSizeSlot.append(createPageSizeControl());
  if (roomsPaginationSlot) roomsPaginationSlot.append(createPagination(3));
  if (plantsPageSizeSlot) plantsPageSizeSlot.append(createPageSizeControl());
  if (plantsPaginationSlot) plantsPaginationSlot.append(createPagination(4));

  if (roomsGrid) renderRoomCards(roomsGrid, MOCK_ROOMS);
  if (plantsGrid) renderPlantCards(plantsGrid, MOCK_PLANTS);

  setupTabs();

  const searchInput = document.querySelector("#plants-search");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      filterPlants(event.target.value);
    });
  }

  applyRoomFilterFromUrl();
}

document.addEventListener("components:loaded", initDashboard);

export { createRoomCard, createPlantCard, renderRoomCards, renderPlantCards };
