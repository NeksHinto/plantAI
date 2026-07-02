import {
  MOCK_ROOMS,
  MOCK_USER,
  getPlantsByRoom,
  getRoomById,
} from "./mock-data.js";
import { createBadge, fillUserGreeting, getStatusLabel } from "./ui.js";

function createCompactPlantCard(plant) {
  const link = document.createElement("a");
  link.className = "plant-card plant-card--compact";
  link.href = `plant.html?id=${plant.id}`;

  link.innerHTML = `
    <img class="plant-card__image" src="${plant.image}" alt="${plant.name}">
    <div class="plant-card__body">
      <h3 class="plant-card__name">${plant.name}</h3>
      <p class="plant-card__room">${plant.potType ?? ""}</p>
    </div>
  `;

  link.querySelector(".plant-card__body").append(
    createBadge(plant.status, getStatusLabel(plant.status))
  );

  return link;
}

function createExpandedRoom(room, plants) {
  const section = document.createElement("section");
  section.className = "room-expanded";
  section.innerHTML = `
    <header class="room-expanded__header">
      <img class="room-expanded__image" src="${room.image}" alt="${room.name}">
      <h2 class="room-expanded__title">${room.name}</h2>
    </header>
    <div class="room-expanded__plants" aria-label="Plantas en ${room.name}"></div>
  `;

  section.querySelector(".room-expanded__header").append(
    createBadge(room.status, `${room.badStatePercent}% en mal estado`)
  );

  const plantsContainer = section.querySelector(".room-expanded__plants");
  plants.forEach((plant) => plantsContainer.append(createCompactPlantCard(plant)));

  return section;
}

function createCollapsedRoom(room) {
  const link = document.createElement("a");
  link.className = "room-collapsed";
  link.href = `room.html?id=${room.id}`;

  link.innerHTML = `
    <img class="room-collapsed__image" src="${room.image}" alt="${room.name}">
    <div class="room-collapsed__body">
      <h3 class="room-collapsed__title">${room.name}</h3>
    </div>
    <span aria-hidden="true">›</span>
  `;

  link.querySelector(".room-collapsed__body").append(
    createBadge(room.status, `${room.badStatePercent}% en mal estado`)
  );

  return link;
}

function initRoom() {
  fillUserGreeting("[data-user-greeting]", MOCK_USER.name);

  const params = new URLSearchParams(window.location.search);
  const roomId = params.get("id") ?? "salon";
  const activeRoom = getRoomById(roomId);

  if (!activeRoom) return;

  const expandedContainer = document.querySelector("#room-expanded");
  const collapsedContainer = document.querySelector("#rooms-collapsed");

  if (expandedContainer) {
    const plants = getPlantsByRoom(activeRoom.id);
    expandedContainer.append(createExpandedRoom(activeRoom, plants));
  }

  if (collapsedContainer) {
    const otherRooms = MOCK_ROOMS.filter((room) => room.id !== activeRoom.id);
    otherRooms.forEach((room) => {
      collapsedContainer.append(createCollapsedRoom(room));
    });
  }

  document.title = `${activeRoom.name} | PlantAI`;
}

document.addEventListener("components:loaded", initRoom);
