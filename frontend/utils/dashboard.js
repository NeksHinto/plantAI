import { fetchRooms, fetchPlantsByRoom } from "./rooms-api.js";
import { mapPlantFromApi, mapRoomFromApi } from "./mappers.js";
import { requireAuth } from "./session.js";
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

function applyRoomFilterFromUrl(roomsState, plantsState, renderRooms, renderPlants) {
  const roomId = new URLSearchParams(window.location.search).get("room");
  if (!roomId) return;

  const plantasTab = document.querySelector('.tab-nav__btn[data-tab="plantas"]');
  if (plantasTab) plantasTab.click();

  const room = roomsState.all.find((item) => String(item.id) === String(roomId));
  const searchInput = document.querySelector("#plants-search");

  if (searchInput && room) {
    searchInput.value = room.name;
    plantsState.filtered = filterByQuery(plantsState.all, room.name, ["name", "roomName"]);
    plantsState.page = 1;
    renderPlants();
  }
}

async function initDashboard() {
  const session = requireAuth();
  if (!session) return;

  fillUserGreeting("[data-user-greeting]", session.nombre);

  const roomsGrid = document.querySelector("#rooms-grid");
  const plantsGrid = document.querySelector("#plants-grid");
  const roomsSearchSlot = document.querySelector("#rooms-search");
  const roomsPageSizeSlot = document.querySelector("#rooms-page-size");
  const roomsPaginationSlot = document.querySelector("#rooms-pagination");
  const plantsPageSizeSlot = document.querySelector("#plants-page-size");
  const plantsPaginationSlot = document.querySelector("#plants-pagination");

  showLoading(roomsGrid, "Cargando ambientes...");
  showLoading(plantsGrid, "Cargando plantas...");

  try {
    const { rooms, plants } = await loadDashboardData(session.userId);

    const roomsState = { all: rooms, filtered: rooms, page: 1 };
    const plantsState = { all: plants, filtered: plants, page: 1 };

    if (roomsSearchSlot) {
      const search = createSearchBar("Buscar ambientes...");
      roomsSearchSlot.append(search);
      search.querySelector("input").addEventListener("input", (event) => {
        roomsState.filtered = filterByQuery(roomsState.all, event.target.value, ["name"]);
        roomsState.page = 1;
        renderRooms();
      });
    }

    if (roomsPageSizeSlot) {
      roomsPageSizeSlot.append(createPageSizeControl());
      roomsPageSizeSlot.querySelector("select").addEventListener("change", () => {
        roomsState.page = 1;
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

    const renderRooms = () =>
      renderPagedGrid(
        roomsGrid,
        roomsState.filtered,
        createRoomCard,
        roomsPaginationSlot,
        roomsPageSizeSlot,
        roomsState
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

    renderRooms();
    renderPlants();
    setupTabs();

    const plantsSearch = document.querySelector("#plants-search");
    if (plantsSearch) {
      plantsSearch.addEventListener("input", (event) => {
        plantsState.filtered = filterByQuery(
          plantsState.all,
          event.target.value,
          ["name", "roomName"]
        );
        plantsState.page = 1;
        renderPlants();
      });
    }

    applyRoomFilterFromUrl(roomsState, plantsState, renderRooms, renderPlants);
  } catch (error) {
    showError(roomsGrid, error.message ?? "Error al cargar el dashboard");
    showError(plantsGrid, error.message ?? "Error al cargar plantas");
  }
}

document.addEventListener("components:loaded", initDashboard);
