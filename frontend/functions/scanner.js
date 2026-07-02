import { MOCK_SCAN_RESULT, MOCK_PLANT_DETAIL, formatDate } from "./mock-data.js";
import { setPlantHeaderBack, setPlantHeaderAction } from "./ui.js";

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
}

function renderScanResult(container, result) {
  const scannedDate = new Date(result.scannedAt);

  container.innerHTML = `
    <article class="scan-result">
      <div class="scan-result__body">
        <img class="scan-result__image" src="${result.image}" alt="Imagen escaneada">
        <div>
          <section class="scan-result__section">
            <h3 class="scan-result__section-title">Identificación botánica</h3>
            <p class="scan-result__species">${result.species}</p>
            <p class="scan-result__match">${result.matchPercent}% coincidencia</p>
          </section>
          <section class="scan-result__section">
            <h3 class="scan-result__section-title">Estado de salud</h3>
            <div class="scan-result__alert">
              <p class="scan-result__alert-title">${result.healthLabel}</p>
              <p class="scan-result__recommendation">${result.recommendation}</p>
            </div>
          </section>
        </div>
      </div>
      <p class="scan-result__disclaimer">
        Esta evaluación se basa en inteligencia artificial y puede contener errores.
        Consultá con un especialista si tenés dudas.
      </p>
      <div class="scan-result__actions btn-group">
        <a class="btn btn--secondary" href="scanner.html">Cancelar</a>
        <a class="btn btn--primary" href="plant.html?id=${MOCK_PLANT_DETAIL.id}">Guardar en historial</a>
      </div>
    </article>
    <p style="text-align:center;margin-top:1rem;color:var(--color-text-muted);font-size:0.875rem;">
      Escaneo realizado el <time datetime="${result.scannedAt}">${scannedDate.toLocaleString("es-AR")}</time>
    </p>
  `;
}

function initScannerResults() {
  fillPlantHeader(MOCK_PLANT_DETAIL);
  setPlantHeaderBack("scanner.html");
  setPlantHeaderAction("Ver historial", "plant.html");

  const container = document.querySelector("#scan-result-container");
  if (container) renderScanResult(container, MOCK_SCAN_RESULT);
}

document.addEventListener("components:loaded", initScannerResults);
