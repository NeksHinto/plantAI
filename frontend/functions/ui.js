import { HEALTH_STATUS } from "./mock-data.js";

const STATUS_LABELS = {
  [HEALTH_STATUS.SALUDABLE]: "Saludable",
  [HEALTH_STATUS.ATENCION]: "Atención",
  [HEALTH_STATUS.CRITICO]: "Crítico",
  [HEALTH_STATUS.MEJORANDO]: "Mejorando",
  [HEALTH_STATUS.SALUD_OPTIMA]: "Salud Óptima",
  [HEALTH_STATUS.ALERTA]: "Alerta",
};

export function getStatusLabel(status) {
  return STATUS_LABELS[status] ?? status;
}

export function getStatusFromPercent(percent) {
  if (percent === 0) return HEALTH_STATUS.SALUDABLE;
  if (percent >= 40) return HEALTH_STATUS.CRITICO;
  return HEALTH_STATUS.ATENCION;
}

export function createBadge(status, label) {
  const badge = document.createElement("span");
  badge.className = `badge badge--${status}`;
  badge.textContent = label ?? getStatusLabel(status);
  return badge;
}

export function createPageSizeControl() {
  const wrapper = document.createElement("div");
  wrapper.className = "page-size";
  wrapper.innerHTML = `
    <span>Mostrar</span>
    <select class="page-size__select" aria-label="Cantidad por página">
      <option value="6" selected>6</option>
      <option value="12">12</option>
      <option value="24">24</option>
    </select>
    <span>por página</span>
  `;
  return wrapper;
}

export function createPagination(totalPages, currentPage = 1) {
  const nav = document.createElement("nav");
  nav.className = "pagination";
  nav.setAttribute("aria-label", "Paginación");

  const prev = document.createElement("button");
  prev.className = "pagination__btn";
  prev.textContent = "‹";
  prev.disabled = currentPage === 1;
  nav.append(prev);

  for (let page = 1; page <= totalPages; page++) {
    const btn = document.createElement("button");
    btn.className = "pagination__btn";
    if (page === currentPage) btn.classList.add("is-active");
    btn.textContent = String(page);
    nav.append(btn);
  }

  const next = document.createElement("button");
  next.className = "pagination__btn";
  next.textContent = "›";
  next.disabled = currentPage === totalPages;
  nav.append(next);

  return nav;
}

export function createSearchBar(placeholder) {
  const wrapper = document.createElement("div");
  wrapper.className = "search-bar";
  wrapper.innerHTML = `
    <span class="search-bar__icon" aria-hidden="true">🔍</span>
    <input class="search-bar__input" type="search" placeholder="${placeholder}">
  `;
  return wrapper;
}

export function fillUserGreeting(selector, userName) {
  const element = document.querySelector(selector);
  if (element) element.textContent = `Hola, ${userName}`;
}

export function setPlantHeaderBack(href) {
  const backLink = document.querySelector(".plant-header__back");
  if (backLink) backLink.href = href;
}

export function setPlantHeaderAction(label, href) {
  const action = document.querySelector("#plant-header-action");
  if (action) {
    action.textContent = label;
    action.href = href;
  }
}
