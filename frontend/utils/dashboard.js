import { fetchRooms, fetchPlantsByRoom } from "./rooms-api.js";
import { mapPlantFromApi, mapRoomFromApi } from "./mappers.js";
import { setupRoomCreation, setupRoomEdition, setupRoomDeletion } from "./room-management.js";
import { requireAuth, setupAuthGuard } from "./session.js";
import { paginateItems, filterByQuery } from "./pagination.js";
import {
  createRoomCard,
  createPlantCard,
} from "./cards.js";
import {
  createPageSizeControl,
  createPagination,
  createSearchBar,
  fillUserGreeting,
  showError,
  showLoading,
  refreshIcons,
} from "./ui.js";

const DEFAULT_PAGE_SIZE = 6;

async function loadDashboardData(userId) {
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

  const allPlants = roomsWithPlants.flatMap((room) =>
    room.plants.map((plant) => ({ ...plant, roomName: room.name }))
  );

  return { rooms: roomsWithPlants, plants: allPlants };
}

function renderPagedGrid(container, items, renderCard, paginationSlot, pageSizeSlot, state) {
  const pageSize = Number(pageSizeSlot?.querySelector("select")?.value ?? DEFAULT_PAGE_SIZE);
  const { items: pageItems, totalPages } = paginateItems(items, state.page, pageSize);

  container.replaceChildren();
  pageItems.forEach((item) => container.append(renderCard(item)));

  if (paginationSlot) {
    paginationSlot.replaceChildren();
    const pagination = createPagination(totalPages, state.page);
    pagination.querySelectorAll(".pagination__btn").forEach((btn, index) => {
      if (index === 0) {
        btn.addEventListener("click", () => {
          state.page = Math.max(1, state.page - 1);
          renderPagedGrid(container, state.filtered, renderCard, paginationSlot, pageSizeSlot, state);
        });
      } else if (index === pagination.children.length - 1) {
        btn.addEventListener("click", () => {
          state.page = Math.min(totalPages, state.page + 1);
          renderPagedGrid(container, state.filtered, renderCard, paginationSlot, pageSizeSlot, state);
        });
      } else {
        const pageNum = Number(btn.textContent);
        btn.addEventListener("click", () => {
          state.page = pageNum;
          renderPagedGrid(container, state.filtered, renderCard, paginationSlot, pageSizeSlot, state);
        });
      }
    });
    paginationSlot.append(pagination);
  }
}

function renderRoomsGrid(
  container,
  rooms,
  paginationSlot,
  pageSizeSlot,
  state,
  onEditRoom,
  onDeleteRoom
) {
  const select = pageSizeSlot.querySelector("select");
  const pageSize = Number(select.value);

  const page = paginateItems(
    rooms,
    state.page,
    pageSize
  );

  function renderAgain() {
    renderRoomsGrid(
      container,
      state.filtered,
      paginationSlot,
      pageSizeSlot,
      state,
      onEditRoom,
      onDeleteRoom
    );
  }

  function changePage(pageNumber) {
    state.page = pageNumber;
    state.expandedRoomId = null;
    renderAgain();
  }

  container.replaceChildren();

  page.items.forEach((room) => {
    const expanded =
      String(state.expandedRoomId) === String(room.id);

    const card = createRoomCard(
      room,
      expanded,
      () => {
        if (expanded) {
          state.expandedRoomId = null;
        } else {
          state.expandedRoomId = room.id;
        }

        renderAgain();
      },
      onEditRoom,
      onDeleteRoom
    );

    container.append(card);
  });

  paginationSlot.replaceChildren();

  const pagination = createPagination(
    page.totalPages,
    state.page
  );

  const buttons = pagination.querySelectorAll(
    ".pagination__btn"
  );

  buttons.forEach((button, index) => {
    const isPrevious = index === 0;
    const isNext = index === buttons.length - 1;

    if (isPrevious) {
      button.addEventListener("click", () => {
        changePage(Math.max(1, state.page - 1));
      });
    } else if (isNext) {
      button.addEventListener("click", () => {
        changePage(
          Math.min(page.totalPages, state.page + 1)
        );
      });
    } else {
      button.addEventListener("click", () => {
        changePage(Number(button.textContent));
      });
    }
  });

  paginationSlot.append(pagination);
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

function setupRoomSelectionModal(roomsState) {
  const openBtn = document.querySelector("#add-plant-button");
  const modal = document.querySelector("#select-room-modal");
  const searchContainer = document.querySelector("#select-room-search-container");
  const listContainer = document.querySelector("#select-room-list");
  const cancelBtn = document.querySelector("#cancel-select-room");
  const confirmBtn = document.querySelector("#confirm-select-room");
  const errorMsg = document.querySelector("#select-room-error");

  if (!openBtn || !modal || !listContainer) return;

  let selectedRoomId = null;

  function closeModal() {
    modal.hidden = true;
    selectedRoomId = null;
    if (confirmBtn) confirmBtn.disabled = true;
    if (errorMsg) errorMsg.hidden = true;
  }

  function renderRoomList(filterText = "") {
    listContainer.replaceChildren();
    selectedRoomId = null;
    if (confirmBtn) confirmBtn.disabled = true;

    const availableRooms = filterText
      ? filterByQuery(roomsState.all, filterText, ["name"])
      : roomsState.all;

    if (roomsState.all.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "room-selector__empty";
      emptyDiv.innerHTML = `
        <i data-lucide="home" class="room-selector__empty-icon" aria-hidden="true"></i>
        <p>No tenés ambientes creados aún. Necesitás crear un ambiente para poder agregar plantas.</p>
        <button class="btn btn--primary btn--sm" id="modal-create-room-btn" type="button">
          Crear primer ambiente
        </button>
      `;
      listContainer.append(emptyDiv);

      emptyDiv.querySelector("#modal-create-room-btn")?.addEventListener("click", () => {
        closeModal();
        document.querySelector("#add-room-button")?.click();
      });

      refreshIcons();
      return;
    }

    if (availableRooms.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "room-selector__empty";
      emptyDiv.innerHTML = `<p>No se encontraron ambientes que coincidan con "${filterText}".</p>`;
      listContainer.append(emptyDiv);
      return;
    }

    availableRooms.forEach((room) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "room-selector__card";
      card.dataset.id = String(room.id);

      const roomImg = room.image || "../src/PlantAI-icon.png";
      const locationText = room.isIndoors ? "Interior" : "Exterior";
      const plantCountText = room.plants.length === 1 ? "1 planta" : `${room.plants.length} plantas`;
      const tempText = room.temperatureLevel ? ` · ${room.temperatureLevel}` : "";

      card.innerHTML = `
        <img class="room-selector__card-img" src="${roomImg}" alt="${room.name}">
        <div class="room-selector__card-body">
          <h3 class="room-selector__card-title">${room.name}</h3>
          <p class="room-selector__card-meta">${plantCountText} · ${locationText}${tempText}</p>
        </div>
        <div class="room-selector__card-check">
          <i data-lucide="check" aria-hidden="true"></i>
        </div>
      `;

      card.addEventListener("click", () => {
        listContainer.querySelectorAll(".room-selector__card").forEach((c) => c.classList.remove("is-selected"));
        card.classList.add("is-selected");
        selectedRoomId = room.id;
        if (confirmBtn) confirmBtn.disabled = false;
      });

      card.addEventListener("dblclick", () => {
        selectedRoomId = room.id;
        confirmSelection();
      });

      listContainer.append(card);
    });

    refreshIcons();
  }

  function openModal() {
    modal.hidden = false;
    if (errorMsg) errorMsg.hidden = true;

    if (searchContainer) {
      searchContainer.replaceChildren();
      if (roomsState.all.length > 2) {
        const searchBar = createSearchBar("Buscar ambiente...");
        searchContainer.append(searchBar);
        searchBar.querySelector("input").addEventListener("input", (e) => {
          renderRoomList(e.target.value);
        });
      }
    }

    renderRoomList();
  }

  function confirmSelection() {
    if (!selectedRoomId) {
      if (errorMsg) {
        errorMsg.textContent = "Por favor seleccioná un ambiente.";
        errorMsg.hidden = false;
      }
      return;
    }
    window.location.href = `scanner.html?roomId=${selectedRoomId}`;
  }

  openBtn.addEventListener("click", openModal);
  cancelBtn?.addEventListener("click", closeModal);
  confirmBtn?.addEventListener("click", confirmSelection);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

function applyRoomFilterFromUrl(roomsState, plantsState, renderRooms, renderPlants, plantsSearchSlot) {
  const roomId = new URLSearchParams(window.location.search).get("room");
  if (!roomId) return;

  const plantasTab = document.querySelector('.tab-nav__btn[data-tab="plantas"]');
  if (plantasTab) plantasTab.click();

  const room = roomsState.all.find((item) => String(item.id) === String(roomId));
  const searchInput = plantsSearchSlot?.querySelector("input");

  if (searchInput && room) {
    searchInput.value = room.name;
    plantsState.filtered = filterByQuery(plantsState.all, room.name, ["name", "roomName"]);
    plantsState.page = 1;
    renderPlants();
  }
}

async function initDashboard() {
  setupAuthGuard();
  const session = requireAuth();
  if (!session) return;

  fillUserGreeting("[data-user-greeting]", session.nombre);

  const roomsGrid = document.querySelector("#rooms-grid");
  const plantsGrid = document.querySelector("#plants-grid");
  const roomsSearchSlot = document.querySelector("#rooms-search");
  const roomsPageSizeSlot = document.querySelector("#rooms-page-size");
  const roomsPaginationSlot = document.querySelector("#rooms-pagination");
  const plantsSearchSlot = document.querySelector("#plants-search");
  const plantsPageSizeSlot = document.querySelector("#plants-page-size");
  const plantsPaginationSlot = document.querySelector("#plants-pagination");

  showLoading(roomsGrid, "Cargando ambientes...");
  showLoading(plantsGrid, "Cargando plantas...");

  try {
    let { rooms, plants } = await loadDashboardData(session.userId);

    const roomsState = { all: rooms, filtered: rooms, page: 1, expandedRoomId: null };
    const plantsState = { all: plants, filtered: plants, page: 1 };

    if (roomsSearchSlot) {
      const search = createSearchBar("Buscar ambientes...");
      roomsSearchSlot.append(search);
      search.querySelector("input").addEventListener("input", (event) => {
        roomsState.filtered = filterByQuery(roomsState.all, event.target.value, ["name"]);
        roomsState.page = 1;
        roomsState.expandedRoomId = null;
        renderRooms();
      });
    }

    if (plantsSearchSlot) {
      const search = createSearchBar("Buscar plantas...");
      plantsSearchSlot.append(search);
      search.querySelector("input").addEventListener("input", (event) => {
        plantsState.filtered = filterByQuery(
          plantsState.all,
          event.target.value,
          ["name", "roomName"]
        );
        plantsState.page = 1;
        renderPlants();
      });
    }

    if (roomsPageSizeSlot) {
      roomsPageSizeSlot.append(createPageSizeControl());
      roomsPageSizeSlot.querySelector("select").addEventListener("change", () => {
        roomsState.page = 1;
        roomsState.expandedRoomId = null;
        renderRooms();
      });
    }

    if (plantsPageSizeSlot) {
      plantsPageSizeSlot.append(createPageSizeControl());
      plantsPageSizeSlot.querySelector("select").addEventListener("change", () => {
        plantsState.page = 1;
        renderPlants();
      });
    }

    async function reloadDashboard() {
      const data = await loadDashboardData(session.userId);

      rooms = data.rooms;
      plants = data.plants;

      roomsState.all = rooms;
      const searchVal = roomsSearchSlot?.querySelector("input")?.value;
      roomsState.filtered = searchVal ? filterByQuery(rooms, searchVal, ["name"]) : rooms;

      if (roomsState.expandedRoomId && !rooms.some((r) => String(r.id) === String(roomsState.expandedRoomId))) {
        roomsState.expandedRoomId = null;
      }

      plantsState.all = plants;
      const plantSearchVal = plantsSearchSlot?.querySelector("input")?.value;
      plantsState.filtered = plantSearchVal ? filterByQuery(plants, plantSearchVal, ["name", "roomName"]) : plants;

      renderRooms();
      renderPlants();
    }

    const openEditRoomModal = setupRoomEdition(reloadDashboard);
    const openDeleteRoomModal = setupRoomDeletion(reloadDashboard);

    const renderRooms = () =>
      renderRoomsGrid(
        roomsGrid,
        roomsState.filtered,
        roomsPaginationSlot,
        roomsPageSizeSlot,
        roomsState,
        openEditRoomModal,
        openDeleteRoomModal
      );

    const renderPlants = () =>
      renderPagedGrid(
        plantsGrid,
        plantsState.filtered,
        createPlantCard,
        plantsPaginationSlot,
        plantsPageSizeSlot,
        plantsState
      );

    setupRoomCreation(session.userId, reloadDashboard);
    setupRoomSelectionModal(roomsState);
    renderRooms();
    renderPlants();
    setupTabs();

    applyRoomFilterFromUrl(roomsState, plantsState, renderRooms, renderPlants, plantsSearchSlot);
  } catch (error) {
    showError(roomsGrid, error.message ?? "Error al cargar el dashboard");
    showError(plantsGrid, error.message ?? "Error al cargar plantas");
  }
}

document.addEventListener("components:loaded", initDashboard);
