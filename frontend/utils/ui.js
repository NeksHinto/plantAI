import { statusLabel } from "./mappers.js";

export function refreshIcons() {
  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
}

export function getStatusLabel(status) {
  return statusLabel(status);
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
  prev.innerHTML = `<i data-lucide="chevron-left" aria-hidden="true"></i>`;
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
  next.innerHTML = `<i data-lucide="chevron-right" aria-hidden="true"></i>`;
  next.disabled = currentPage === totalPages;
  nav.append(next);

  setTimeout(refreshIcons, 0);
  return nav;
}

export function createSearchBar(placeholder) {
  const wrapper = document.createElement("div");
  wrapper.className = "search-bar";
  wrapper.innerHTML = `
    <i data-lucide="search" class="search-bar__icon" aria-hidden="true"></i>
    <input class="search-bar__input" type="search" placeholder="${placeholder}">
  `;
  setTimeout(refreshIcons, 0);
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

export function showError(container, message) {
  if (!container) return;
  container.innerHTML = `<p class="form-error" role="alert">${message}</p>`;
}

export function showLoading(container, message = "Cargando...") {
  if (!container) return;
  container.innerHTML = `<p class="loading-message">${message}</p>`;
}

export function showConfirmModal({ title, message, confirmText = "Eliminar", cancelText = "Cancelar", isDanger = true }) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <h3 class="modal__title">${title}</h3>
        <p class="modal__message">${message}</p>
        <div class="modal__actions">
          <button class="btn btn--outline btn--sm modal__cancel-btn" type="button">${cancelText}</button>
          <button class="btn ${isDanger ? "btn--danger" : "btn--primary"} btn--sm modal__confirm-btn" type="button">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.append(overlay);

    function close(result) {
      overlay.classList.add("is-closing");
      setTimeout(() => {
        overlay.remove();
        resolve(result);
      }, 150);
    }

    overlay.querySelector(".modal__cancel-btn").addEventListener("click", () => close(false));
    overlay.querySelector(".modal__confirm-btn").addEventListener("click", () => close(true));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close(false);
    });
  });
}

