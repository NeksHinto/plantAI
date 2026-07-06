import { createBadge, getStatusLabel } from "./ui.js";

export function createRoomCard(room) {
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

  link.querySelector(".room-card__body").append(
    createBadge(room.status, getStatusLabel(room.status))
  );

  return link;
}

export function createPlantCard(plant) {
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

export function createCompactPlantCard(plant) {
  const link = document.createElement("a");
  link.className = "plant-card plant-card--compact";
  link.href = `plant.html?id=${plant.id}`;

  link.innerHTML = `
    <img class="plant-card__image" src="${plant.image}" alt="${plant.name}">
    <div class="plant-card__body">
      <h3 class="plant-card__name">${plant.name}</h3>
      <p class="plant-card__room">${plant.species ?? ""}</p>
    </div>
  `;

  link.querySelector(".plant-card__body").append(
    createBadge(plant.status, getStatusLabel(plant.status))
  );

  return link;
}

export function createExpandedRoom(room, plants) {
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
  if (plants.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No hay plantas en este ambiente.";
    plantsContainer.append(empty);
  } else {
    plants.forEach((plant) => plantsContainer.append(createCompactPlantCard(plant)));
  }

  const addLink = document.createElement("a");
  addLink.className = "btn btn--secondary";
  addLink.href = `scanner.html?roomId=${room.id}`;
  addLink.textContent = "Agregar nueva planta";
  addLink.style.margin = "0 1rem 1rem";
  section.append(addLink);

  return section;
}

export function createCollapsedRoom(room) {
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
