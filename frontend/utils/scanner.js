import { addPlant, identifyDisease, fetchPlantById } from "./plants-api.js";
import { mapPlantDetailFromApi, mapScanResultFromApi } from "./mappers.js";
import { TEMP_PUBLIC_SCAN_IMAGE_URL } from "./constants.js";
import { requireAuth } from "./session.js";
import {
  createPreviewUrl,
  resolveImageUrlForApi,
  revokePreviewUrl,
  storeScanPreview,
  getScanPreview,
} from "./image.js";
import { formatDateTime } from "./format.js";
import {
  setPlantHeaderBack,
  setPlantHeaderAction,
  showError,
  showLoading,
} from "./ui.js";

let selectedPreviewUrl = null;

function getScanContext() {
  const params = new URLSearchParams(window.location.search);
  return {
    plantId: params.get("plantId"),
    roomId: params.get("roomId"),
  };
}

function fillPlantHeaderFromDetail(plant) {
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

function renderScanResult(container, result, context) {
  const scannedDate = new Date(result.scannedAt);
  const saveHref = context.plantId
    ? `plant.html?id=${context.plantId}`
    : context.savedPlantId
      ? `plant.html?id=${context.savedPlantId}`
      : "dashboard.html";

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
        <a class="btn btn--secondary" href="${context.cancelHref}">Cancelar</a>
        <button class="btn btn--primary" type="button" id="save-scan-btn">Guardar en historial</button>
      </div>
    </article>
    <p class="scan-meta">
      Escaneo realizado el <time datetime="${result.scannedAt}">${formatDateTime(result.scannedAt)}</time>
    </p>
  `;

  const saveBtn = container.querySelector("#save-scan-btn");
  saveBtn.addEventListener("click", () => {
    window.location.href = saveHref;
  });
}

function setupScannerForm() {
  const fileInput = document.querySelector("#scan-file-input");
  const cameraBtn = document.querySelector("#scan-camera-btn");
  const context = getScanContext();

  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      if (selectedPreviewUrl) revokePreviewUrl(selectedPreviewUrl);
      selectedPreviewUrl = createPreviewUrl(file);
    });
  }

  if (cameraBtn) {
    cameraBtn.addEventListener("click", (event) => {
      event.preventDefault();
      // TODO: integrar getUserMedia para captura con cámara
      alert("Captura con cámara pendiente de implementación. Usá 'Adjuntar foto' por ahora.");
    });
  }

  const form = document.querySelector("#scanner-form");
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await runScan(context);
    });
  }
}

async function runScan(context) {
  const session = requireAuth();
  if (!session) return;

  const imageUrl = resolveImageUrlForApi(
    selectedPreviewUrl,
    TEMP_PUBLIC_SCAN_IMAGE_URL
  );

  if (selectedPreviewUrl) {
    storeScanPreview(selectedPreviewUrl);
  }

  const resultsUrl = new URL("scanner-results.html", window.location.href);
  if (context.plantId) resultsUrl.searchParams.set("plantId", context.plantId);
  if (context.roomId) resultsUrl.searchParams.set("roomId", context.roomId);
  resultsUrl.searchParams.set("imageUrl", imageUrl);

  window.location.href = resultsUrl.toString();
}

async function initScannerResults() {
  const session = requireAuth();
  if (!session) return;

  const container = document.querySelector("#scan-result-container");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const context = {
    plantId: params.get("plantId"),
    roomId: params.get("roomId"),
    imageUrl: params.get("imageUrl") ?? TEMP_PUBLIC_SCAN_IMAGE_URL,
    cancelHref: contextCancelHref(params),
  };

  showLoading(container, "Analizando imagen...");

  if (context.plantId) {
    try {
      const rawPlant = await fetchPlantById(context.plantId);
      const plant = mapPlantDetailFromApi(rawPlant);
      fillPlantHeaderFromDetail(plant);
      setPlantHeaderBack(`scanner.html?plantId=${context.plantId}`);
      setPlantHeaderAction("Ver historial", `plant.html?id=${context.plantId}`);
    } catch {
      setPlantHeaderBack("dashboard.html");
    }
  } else {
    setPlantHeaderBack(context.roomId ? `room.html?id=${context.roomId}` : "dashboard.html");
    setPlantHeaderAction("Ver historial", "dashboard.html");
  }

  try {
    let scanPayload;

    if (context.plantId) {
      const response = await identifyDisease({
        imageUrl: context.imageUrl,
        plantId: context.plantId,
      });
      scanPayload = {
        identification: null,
        diagnosis: response.healthRecord,
        imageUrl: context.imageUrl,
        scannedAt: response.healthRecord?.date,
      };
    } else if (context.roomId) {
      const response = await addPlant({
        imageUrl: context.imageUrl,
        userId: session.userId,
        roomId: context.roomId,
        name: "Nueva planta",
      });
      context.savedPlantId = response.plant?.id;
      scanPayload = {
        identification: {
          species: response.plant?.species,
          commonName: response.plant?.common_name,
          accuracy: response.plant?.confidence_score,
        },
        diagnosis: response.initialDiagnosis,
        imageUrl: context.imageUrl,
        scannedAt: new Date().toISOString(),
      };
    } else {
      throw new Error("Falta plantId o roomId para escanear.");
    }

    const result = mapScanResultFromApi(scanPayload);
    result.image = getScanPreview() ?? context.imageUrl;

    if (context.plantId && !scanPayload.identification) {
      try {
        const rawPlant = await fetchPlantById(context.plantId);
        result.species = rawPlant.species ?? result.species;
        result.matchPercent = Math.round(rawPlant.confidence_score ?? 0);
      } catch {
        // mantener valores del escaneo
      }
    }

    renderScanResult(container, result, context);
  } catch (error) {
    showError(container, error.message ?? "Error al procesar el escaneo");
  }
}

function contextCancelHref(params) {
  if (params.get("plantId")) {
    return `scanner.html?plantId=${params.get("plantId")}`;
  }
  if (params.get("roomId")) {
    return `scanner.html?roomId=${params.get("roomId")}`;
  }
  return "dashboard.html";
}

function initScanner() {
  const context = getScanContext();

  if (context.plantId) {
    initPlantHeaderForScanner(context.plantId);
    setupScannerForm();
  } else if (context.roomId) {
    setPlantHeaderBack(`room.html?id=${context.roomId}`);
    setPlantHeaderAction("Ver historial", "dashboard.html");
    setupScannerForm();
  } else {
    const zone = document.querySelector(".scanner-zone");
    showError(zone, "Falta plantId o roomId. Volvé al dashboard o a un ambiente.");
  }
}

async function initPlantHeaderForScanner(plantId) {
  try {
    const rawPlant = await fetchPlantById(plantId);
    const plant = mapPlantDetailFromApi(rawPlant);
    fillPlantHeaderFromDetail(plant);
    setPlantHeaderBack(`plant.html?id=${plant.id}`);
    setPlantHeaderAction("Ver historial", `plant.html?id=${plant.id}`);
  } catch {
    setPlantHeaderBack("dashboard.html");
  }
}

function init() {
  if (document.querySelector("#scan-result-container")) {
    initScannerResults();
  } else {
    initScanner();
  }
}

document.addEventListener("components:loaded", init);
