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

// Agrega un botón de borrado (cruz) con ícono a la barra de búsqueda
export function setupSearchBarClear(wrapper) {
  if (!wrapper) return;
  const input = wrapper.querySelector("input");
  if (!input) return;

  // Crea el botón con ícono 'x' si no existe
  let clearBtn = wrapper.querySelector(".search-bar__clear");
  if (!clearBtn) {
    clearBtn = document.createElement("button");
    clearBtn.className = "search-bar__clear";
    clearBtn.type = "button";
    clearBtn.setAttribute("aria-label", "Limpiar búsqueda");
    clearBtn.hidden = !input.value;
    clearBtn.innerHTML = `<i data-lucide="x" aria-hidden="true"></i>`;
    wrapper.append(clearBtn);
  }

  // Muestra u oculta el botón según si hay texto escrito
  const updateVisibility = () => {
    clearBtn.hidden = !input.value;
  };

  input.addEventListener("input", updateVisibility);
  clearBtn.addEventListener("click", () => {
    input.value = "";
    updateVisibility();
    input.dispatchEvent(new Event("input")); // Dispara el filtro de búsqueda
    input.focus();
  });

  updateVisibility();
  setTimeout(refreshIcons, 0);
}

// Crea un buscador dinámico con icono de lupa y botón de borrado
export function createSearchBar(placeholder) {
  const wrapper = document.createElement("div");
  wrapper.className = "search-bar";
  wrapper.innerHTML = `
    <i data-lucide="search" class="search-bar__icon" aria-hidden="true"></i>
    <input class="search-bar__input" type="search" placeholder="${placeholder}">
  `;
  setupSearchBarClear(wrapper);
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

export async function withSkeleton(container, typeOrMessage, fetchPromiseFn, count = 3) {
  if (!container) return await fetchPromiseFn();

  let timer = null;
  let skeletonRendered = false;
  let startTime = 0;

  timer = setTimeout(() => {
    skeletonRendered = true;
    startTime = Date.now();
    showLoading(container, typeOrMessage, count);
  }, 100);

  try {
    const data = await fetchPromiseFn();
    if (timer) clearTimeout(timer);

    if (skeletonRendered) {
      const elapsed = Date.now() - startTime;
      const minDisplay = 300;
      if (elapsed < minDisplay) {
        await new Promise((resolve) => setTimeout(resolve, minDisplay - elapsed));
      }
    }

    container.classList.add("content-fade-in");
    setTimeout(() => container.classList.remove("content-fade-in"), 350);

    return data;
  } catch (err) {
    if (timer) clearTimeout(timer);
    throw err;
  }
}

export function showLoading(container, typeOrMessage = "card", count = 3) {
  if (!container) return;
  
  if (typeOrMessage.includes("ambiente")) {
    if (typeOrMessage.includes("ambientes")) {
      showRoomsSkeleton(container, count);
    } else {
      showRoomDetailSkeleton(container);
    }
  } else if (typeOrMessage.includes("planta")) {
    showPlantsSkeleton(container, count);
  } else if (typeOrMessage.includes("historial")) {
    showTimelineSkeleton(container, 2);
  } else if (typeOrMessage.includes("imagen") || typeOrMessage.includes("Analizando")) {
    showScannerSkeleton(container);
  } else {
    showPlantsSkeleton(container, count);
  }
}

export function showRoomsSkeleton(container, count = 3) {
  if (!container) return;
  const cardsHtml = Array(count)
    .fill(0)
    .map(
      () => `
    <div class="skeleton-card skeleton-room-card skeleton-fade-in" aria-hidden="true">
      <div class="skeleton-room-header">
        <div class="skeleton-box skeleton-circle" style="width: 3.5rem; height: 3.5rem; flex-shrink: 0;"></div>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;">
          <div class="skeleton-box" style="height: 1.125rem; width: 60%;"></div>
          <div class="skeleton-box" style="height: 0.875rem; width: 40%;"></div>
        </div>
        <div class="skeleton-box skeleton-pill" style="height: 1.5rem; width: 4.5rem;"></div>
      </div>
      <div class="skeleton-room-metrics">
        <div class="skeleton-box" style="height: 2.25rem;"></div>
        <div class="skeleton-box" style="height: 2.25rem;"></div>
        <div class="skeleton-box" style="height: 2.25rem;"></div>
      </div>
    </div>`
    )
    .join("");
  container.innerHTML = cardsHtml;
}

export function showPlantsSkeleton(container, count = 3) {
  if (!container) return;
  const cardsHtml = Array(count)
    .fill(0)
    .map(
      () => `
    <div class="skeleton-card skeleton-plant-card skeleton-fade-in" aria-hidden="true">
      <div class="skeleton-box" style="width: 4rem; height: 4rem; border-radius: var(--radius-sm); flex-shrink: 0;"></div>
      <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;">
        <div class="skeleton-box" style="height: 1.125rem; width: 55%;"></div>
        <div class="skeleton-box" style="height: 0.875rem; width: 35%;"></div>
        <div class="skeleton-box skeleton-pill" style="height: 1.25rem; width: 5rem;"></div>
      </div>
    </div>`
    )
    .join("");
  container.innerHTML = cardsHtml;
}

export function showRoomDetailSkeleton(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="skeleton-room-expanded skeleton-fade-in" aria-hidden="true">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
          <div class="skeleton-box skeleton-circle" style="width: 4rem; height: 4rem;"></div>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; flex: 1;">
            <div class="skeleton-box" style="height: 1.5rem; width: 45%;"></div>
            <div class="skeleton-box" style="height: 0.875rem; width: 25%;"></div>
          </div>
        </div>
        <div class="skeleton-box skeleton-pill" style="height: 2rem; width: 6rem;"></div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: 1rem; margin-top: 0.5rem;">
        <div class="skeleton-box" style="height: 4.5rem; border-radius: var(--radius-md);"></div>
        <div class="skeleton-box" style="height: 4.5rem; border-radius: var(--radius-md);"></div>
        <div class="skeleton-box" style="height: 4.5rem; border-radius: var(--radius-md);"></div>
      </div>
      <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem;">
        <div class="skeleton-box" style="height: 1.25rem; width: 30%;"></div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: 1rem;">
          <div class="skeleton-card skeleton-plant-card">
            <div class="skeleton-box" style="width: 3.5rem; height: 3.5rem; border-radius: var(--radius-sm);"></div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 0.4rem;">
              <div class="skeleton-box" style="height: 1rem; width: 60%;"></div>
              <div class="skeleton-box" style="height: 0.8rem; width: 40%;"></div>
            </div>
          </div>
          <div class="skeleton-card skeleton-plant-card">
            <div class="skeleton-box" style="width: 3.5rem; height: 3.5rem; border-radius: var(--radius-sm);"></div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 0.4rem;">
              <div class="skeleton-box" style="height: 1rem; width: 60%;"></div>
              <div class="skeleton-box" style="height: 0.8rem; width: 40%;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

export function showPlantInfoSkeleton(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="skeleton-plant-detail skeleton-fade-in" aria-hidden="true">
      <div style="display: flex; gap: 1rem; align-items: center;">
        <div class="skeleton-box" style="width: 5rem; height: 5rem; border-radius: var(--radius-md); flex-shrink: 0;"></div>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;">
          <div class="skeleton-box" style="height: 1.5rem; width: 60%;"></div>
          <div class="skeleton-box" style="height: 1rem; width: 40%;"></div>
          <div class="skeleton-box skeleton-pill" style="height: 1.25rem; width: 6rem;"></div>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-top: 0.5rem;">
        <div class="skeleton-box" style="height: 2.25rem;"></div>
        <div class="skeleton-box" style="height: 2.25rem;"></div>
      </div>
    </div>`;
}

export function showTimelineSkeleton(container, count = 2) {
  if (!container) return;
  const itemsHtml = Array(count)
    .fill(0)
    .map(
      () => `
    <div class="skeleton-timeline-item skeleton-fade-in" aria-hidden="true">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
        <div class="skeleton-box" style="height: 0.875rem; width: 6rem;"></div>
        <div class="skeleton-box skeleton-pill" style="height: 1.25rem; width: 5.5rem;"></div>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <div class="skeleton-box" style="width: 4rem; height: 4rem; border-radius: var(--radius-sm); flex-shrink: 0;"></div>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 0.4rem;">
          <div class="skeleton-box" style="height: 1rem; width: 75%;"></div>
          <div class="skeleton-box" style="height: 0.8rem; width: 90%;"></div>
        </div>
      </div>
    </div>`
    )
    .join("");
  container.innerHTML = `<div class="skeleton-timeline" aria-hidden="true">${itemsHtml}</div>`;
}

export function showScannerSkeleton(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="skeleton-scanner skeleton-fade-in" aria-hidden="true">
      <div class="skeleton-scanner__scanline"></div>
      <div class="skeleton-box" style="width: 100%; height: 14rem; border-radius: var(--radius-md);"></div>
      <div style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; margin-top: 0.5rem;">
        <div class="skeleton-box skeleton-pill" style="height: 1.75rem; width: 10rem;"></div>
        <div class="skeleton-box" style="height: 1.25rem; width: 70%;"></div>
        <div class="skeleton-box" style="height: 0.875rem; width: 85%;"></div>
        <div class="skeleton-box" style="height: 0.875rem; width: 60%;"></div>
      </div>
      <div style="width: 100%; display: flex; gap: 1rem; margin-top: 1rem;">
        <div class="skeleton-box" style="height: 2.75rem; flex: 1; border-radius: var(--radius-md);"></div>
        <div class="skeleton-box" style="height: 2.75rem; flex: 1; border-radius: var(--radius-md);"></div>
      </div>
    </div>`;
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

