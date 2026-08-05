import { createBadge, getStatusLabel, refreshIcons } from "./ui.js";

export function createRoomCard(room, expanded, onClick, onEdit, onDelete) {
  const card = document.createElement("article");

  if (expanded) {
    card.className = "room-card room-card--expanded";
  } else {
    card.className = "room-card";
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "room-card__header";
  button.setAttribute("aria-expanded", String(expanded));

  let statusClass = "atencion";

  if (room.badStatePercent === 0) {
    statusClass = "saludable";
  } else if (room.badStatePercent >= 40) {
    statusClass = "critico";
  }

  button.innerHTML = `
    <img
      class="room-card__image"
      src="${room.image}"
      alt="${room.name}"
    >

    <div class="room-card__body">
      <h3 class="room-card__title">${room.name}</h3>
      <p class="room-card__meta">${room.plantCount} plantas · ${room.isIndoors ? "Interior" : "Exterior"}${room.temperatureLevel ? ` · ${room.temperatureLevel}` : ""}</p>
    </div>

    <p
      class="room-card__status-text
      room-card__status-text--${statusClass}"
    >
      ${room.badStatePercent}% en mal estado
    </p>

    <span class="room-card__chevron">
      ${expanded ? '<i data-lucide="chevron-up" aria-hidden="true"></i>' : '<i data-lucide="chevron-down" aria-hidden="true"></i>'}
    </span>
  `;

  button.addEventListener("click", onClick);
  card.append(button);

  if (expanded) {
    const content = document.createElement("div");
    content.className = "room-card__expanded-content";

    const title = document.createElement("h4");
    title.className = "room-card__plants-title";
    title.textContent = "Plantas en este ambiente";

    const plants = document.createElement("div");
    plants.className = "room-card__plants";

    if (room.plants.length === 0) {
      const message = document.createElement("p");
      message.textContent = "No hay plantas en este ambiente.";
      plants.append(message);
    } else {
      room.plants.forEach((plant) => {
        plants.append(createCompactPlantCard(plant));
      });
    }

    const actions = document.createElement("div");
    actions.className = "room-card__actions";

    const addPlantLink = document.createElement("a");
    addPlantLink.className = "btn btn--secondary";
    addPlantLink.href = `scanner.html?roomId=${room.id}`;
    addPlantLink.textContent = "Agregar nueva planta";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn btn--secondary";
    editBtn.textContent = "Editar ambiente";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (onEdit) onEdit(room);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn--danger-outline";
    deleteBtn.textContent = "Eliminar ambiente";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (onDelete) onDelete(room);
    });

    actions.append(addPlantLink, editBtn, deleteBtn);

    content.append(title, plants, actions);
    card.append(content);
  }

  return card;
}

export function createPlantCard(plant) {
  const link = document.createElement("a");
  link.className = "plant-card";
  link.href = `plant.html?id=${plant.id}`;

  link.innerHTML = `
    <img class="plant-card__image" src="${plant.image}" alt="${plant.name}">
    <div class="plant-card__body">
      <h3 class="plant-card__name">${plant.name}</h3>
      <p class="plant-card__room">${plant.commonName || plant.species || ""} · ${plant.roomName}</p>
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
      <p class="plant-card__room">${plant.commonName || plant.species || ""}</p>
    </div>
  `;

  link.querySelector(".plant-card__body").append(
    createBadge(plant.status, getStatusLabel(plant.status))
  );

  return link;
}
