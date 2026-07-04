export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

export function createPreviewUrl(file) {
  return URL.createObjectURL(file);
}

export function revokePreviewUrl(url) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

// TODO: enviar el archivo real al backend (multipart) en lugar de URL pública temporal
export function resolveImageUrlForApi(previewUrl, fallbackPublicUrl) {
  if (previewUrl?.startsWith("http")) return previewUrl;
  return fallbackPublicUrl;
}
const SCAN_PREVIEW_KEY = "plantai_scan_preview";

export function storeScanPreview(url) {
  sessionStorage.setItem(SCAN_PREVIEW_KEY, url);
}

export function getScanPreview() {
  return sessionStorage.getItem(SCAN_PREVIEW_KEY);
}

export function clearScanPreview() {
  sessionStorage.removeItem(SCAN_PREVIEW_KEY);
}
