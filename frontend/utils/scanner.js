import { addPlant, identifyDisease, fetchPlantById, analyzeScan } from "./plants-api.js";
import { mapPlantDetailFromApi, mapScanResultFromApi } from "./mappers.js";
import { TEMP_PUBLIC_SCAN_IMAGE_URL } from "./constants.js";
import { requireAuth } from "./session.js";
import {
  createPreviewUrl,
  resolveImageUrlForApi,
  revokePreviewUrl,
  storeScanPreview,
  getScanPreview,
  readFileAsDataUrl,
  getScanPreviewFile,
} from "./image.js";
import { formatDateTime } from "./format.js";
import {
  setPlantHeaderBack,
  setPlantHeaderAction,
  showError,
  showLoading,
} from "./ui.js";

let selectedFile = null;
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
    avatar.alt = plant.name;
  }
  if (name) name.textContent = plant.name;
  if (species) species.textContent = plant.species;
}

function renderScanResult(container, result, context, onSave) {
  const scannedDate = new Date(result.scannedAt);
  const saveHref = context.plantId
    ? `plant.html?id=${context.plantId}`
    : context.savedPlantId
      ? `plant.html?id=${context.savedPlantId}`
      : "dashboard.html";

  const speciesMatchClass = result.isSpeciesLowConfidence
    ? "scan-result__match scan-result__match--warning"
    : "scan-result__match";

  const speciesWarningBanner = result.isSpeciesLowConfidence
    ? `
      <div class="scan-result__warning-banner">
        <i data-lucide="alert-triangle"></i>
        <span>Identificación dudosa (coincidencia menor al 15%). Verificá si la especie detectada es correcta.</span>
      </div>
    `
    : "";

  const diagnosisWarningBanner = result.isDiagnosisLowConfidence
    ? `
      <div class="scan-result__warning-banner">
        <i data-lucide="alert-triangle"></i>
        <span>Diagnóstico con baja precisión (confianza menor al 15%). El resultado de salud podría ser impreciso.</span>
      </div>
    `
    : "";

  container.innerHTML = `
    <article class="scan-result">
      <div class="scan-result__body">
        <img class="scan-result__image" src="${result.image}" alt="Imagen escaneada">
        <div>
          <section class="scan-result__section">
            <h3 class="scan-result__section-title">Identificación botánica</h3>
            <p class="scan-result__species">${result.species}</p>
            <p class="${speciesMatchClass}">${result.matchPercent}% coincidencia</p>
            ${speciesWarningBanner}
          </section>
          <section class="scan-result__section">
            <h3 class="scan-result__section-title">Estado de salud</h3>
            <div class="scan-result__alert">
              <p class="scan-result__alert-title">${result.healthLabel}</p>
              <p class="scan-result__recommendation">${result.recommendation}</p>
            </div>
            ${diagnosisWarningBanner}
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

  try {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  } catch (e) {
    // ignore
  }

  const saveBtn = container.querySelector("#save-scan-btn");
  saveBtn.addEventListener("click", async () => {
    if (!onSave) {
      window.location.href = saveHref;
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = "Guardando...";
    try {
      const redirectUrl = await onSave();
      window.location.href = redirectUrl;
    } catch (err) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Guardar en historial";
      alert(err.message || "Error al guardar en el historial.");
    }
  });
}

function renderUnidentifiedResult(container, context, customMessage) {
  const retryHref = context.roomId
    ? `scanner.html?roomId=${context.roomId}`
    : context.plantId
      ? `scanner.html?plantId=${context.plantId}`
      : "dashboard.html";

  container.innerHTML = `
    <article class="scan-result scan-result--failed">
      <div class="scan-result__body scan-result__body--failed">
        <div class="scan-result__failed-icon">
          <i data-lucide="alert-octagon"></i>
        </div>
        <section class="scan-result__section">
          <h3 class="scan-result__failed-title">Especie no identificada</h3>
          <p class="scan-result__failed-text">
            ${customMessage || "No pudimos reconocer la especie de tu planta. Intentá tomar una foto más nítida o centrada en las hojas."}
          </p>
        </section>
      </div>
      <div class="scan-result__actions btn-group">
        <a class="btn btn--secondary" href="${context.cancelHref}">Cancelar</a>
        <a class="btn btn--primary" href="${retryHref}">Volver a escanear</a>
      </div>
    </article>
  `;

  try {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  } catch (e) {
    // ignore
  }
}

function handleSelectedFile(file) {
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("El archivo seleccionado no es una imagen valida");
    const fileInput = document.querySelector("#scan-file-input");
    if (fileInput) fileInput.value = "";
    return;
  }

  selectedFile = file;

  if (selectedPreviewUrl) {
    revokePreviewUrl(selectedPreviewUrl);
  }

  selectedPreviewUrl = createPreviewUrl(file);

  const preview = document.querySelector("#scanner-preview");
  const previewImage = document.querySelector("#scanner-preview-image");
  const previewName = document.querySelector("#scanner-preview-name");
  const submitBtn = document.querySelector("#scan-submit-btn");

  if (previewImage) {
    previewImage.src = selectedPreviewUrl;
  }

  if (previewName) {
    previewName.textContent = file.name;
  }

  if (preview) {
    preview.hidden = false;
  }

  if (submitBtn) {
    submitBtn.disabled = false;
  }
}

function openCameraModal(onCapture) {
  let currentStream = null;
  let currentFacingMode = "environment"; // Priorizar cámara trasera

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  overlay.innerHTML = `
    <div class="modal modal--camera" role="dialog" aria-modal="true">
      <h3 class="modal__title">Escanear planta</h3>
      <p class="modal__message">Alineá tu planta en el visor para tomar la foto.</p>
      
      <div class="camera-viewport">
        <video class="camera-video" autoplay playsinline></video>
      </div>

      <div class="camera-controls">
        <button class="camera-action-btn camera-close-btn" type="button" title="Cancelar">
          <i data-lucide="x"></i>
        </button>
        
        <button class="camera-shutter" type="button" title="Capturar foto">
          <i data-lucide="camera"></i>
        </button>
        
        <button class="camera-action-btn camera-flip-btn" type="button" title="Voltear cámara" style="display: none;">
          <i data-lucide="refresh-cw"></i>
        </button>
      </div>
    </div>
  `;

  document.body.append(overlay);

  const video = overlay.querySelector(".camera-video");
  const shutterBtn = overlay.querySelector(".camera-shutter");
  const closeBtn = overlay.querySelector(".camera-close-btn");
  const flipBtn = overlay.querySelector(".camera-flip-btn");

  // Actualizar los iconos de Lucide cargados
  try {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  } catch (e) {
    console.warn("Lucide refresh error in camera modal:", e);
  }

  function stopStream() {
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
      currentStream = null;
    }
  }

  function closeCameraModal() {
    stopStream();
    overlay.classList.add("is-closing");
    setTimeout(() => {
      overlay.remove();
    }, 150);
  }

  async function startCamera(facingMode) {
    stopStream();
    try {
      currentStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } },
        audio: false
      });
      video.srcObject = currentStream;

      const videoTrack = currentStream.getVideoTracks()[0];
      const settings = videoTrack ? videoTrack.getSettings() : {};
      const activeFacingMode = settings.facingMode || facingMode;

      // Espejar la imagen del visor si estamos usando la cámara frontal (para que se sienta natural)
      if (activeFacingMode === "user") {
        video.classList.remove("camera-video--unmirrored");
      } else {
        video.classList.add("camera-video--unmirrored");
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      alert("No se pudo acceder a la cámara. Por favor, comprobá los permisos e intentá nuevamente o adjuntá un archivo.");
      closeCameraModal();
    }
  }

  // Detectar si hay múltiples cámaras disponibles para habilitar el botón de voltear
  navigator.mediaDevices.enumerateDevices()
    .then((devices) => {
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      if (videoDevices.length > 1) {
        flipBtn.style.display = "flex";
      }
    })
    .catch((err) => {
      console.warn("Error enumerando cámaras:", err);
    });

  // Conectar eventos del modal
  flipBtn.addEventListener("click", () => {
    currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
    startCamera(currentFacingMode);
  });

  shutterBtn.addEventListener("click", () => {
    if (!video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    // Verificar si la cámara activa real es de tipo "user" para dibujar la imagen espejada
    const videoTrack = currentStream ? currentStream.getVideoTracks()[0] : null;
    const settings = videoTrack ? videoTrack.getSettings() : {};
    const activeFacingMode = settings.facingMode || currentFacingMode;

    if (activeFacingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `captura-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
        closeCameraModal();
      } else {
        alert("Error al capturar la imagen. Por favor, intentá de nuevo.");
      }
    }, "image/jpeg", 0.95);
  });

  closeBtn.addEventListener("click", closeCameraModal);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeCameraModal();
    }
  });

  startCamera(currentFacingMode);
}

function setupScannerForm() {
  const fileInput = document.querySelector("#scan-file-input");
  const cameraBtn = document.querySelector("#scan-camera-btn");
  const context = getScanContext();

  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      handleSelectedFile(file);
    });
  }

  if (cameraBtn) {
    cameraBtn.addEventListener("click", (event) => {
      event.preventDefault();
      openCameraModal((file) => {
        handleSelectedFile(file);
      });
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

  if (!selectedPreviewUrl) {
    alert("Selecciona una imagen antes de analizar");
    return;
  }

  if (selectedFile) {
    try {
      const dataUrl = await readFileAsDataUrl(selectedFile);
      storeScanPreview(dataUrl);
    } catch {
      storeScanPreview(selectedPreviewUrl);
    }
  } else if (selectedPreviewUrl) {
    storeScanPreview(selectedPreviewUrl);
  }

  const imageUrl = resolveImageUrlForApi(
    selectedPreviewUrl,
    TEMP_PUBLIC_SCAN_IMAGE_URL
  );

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

  const scanFile = getScanPreviewFile();

  try {
    const scanPayload = await analyzeScan({
      imageFile: scanFile,
      imageUrl: context.imageUrl,
      roomId: context.roomId,
      plantId: context.plantId,
    });

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

    renderScanResult(container, result, context, async () => {
      if (context.roomId) {
        const response = await addPlant({
          imageUrl: context.imageUrl,
          userId: session.userId,
          roomId: context.roomId,
          name: "Nueva planta",
          species: result.species,
          commonName: result.commonName,
          diagnosis: result.healthLabel,
          diagnosisAccuracy: result.diagnosisAccuracy,
          treatmentNotes: result.recommendation,
          confidenceScore: result.matchPercent,
        });
        return `plant.html?id=${response.plant?.id}`;
      } else if (context.plantId) {
        await identifyDisease({
          imageUrl: context.imageUrl,
          plantId: context.plantId,
          diagnosis: result.healthLabel,
          diagnosisAccuracy: result.diagnosisAccuracy,
          treatmentNotes: result.recommendation,
        });
        return `plant.html?id=${context.plantId}`;
      }
      return "dashboard.html";
    });
  } catch (error) {
    if (error.status === 422 || error.code === "SPECIES_NOT_FOUND" || error.message?.includes("5%")) {
      renderUnidentifiedResult(container, context, error.message);
    } else {
      showError(container, error.message ?? "Error al procesar el escaneo");
    }
  }
}

function contextCancelHref(params) {
  const plantId = params.get("plantId");
  const roomId = params.get("roomId");

  if (plantId) {
    return `scanner.html?plantId=${plantId}`;
  }
  if (roomId) {
    return `scanner.html?roomId=${roomId}`;
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
