// Convierte un archivo de imagen a cadena DataURL Base64
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

// Crea una URL temporal para vista previa de imagen
export function createPreviewUrl(file) {
  return URL.createObjectURL(file);
}

// Libera la URL temporal de vista previa
export function revokePreviewUrl(url) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

// Resuelve la URL de la imagen a enviar a la API
export function resolveImageUrlForApi(previewUrl, fallbackPublicUrl) {
  if (previewUrl?.startsWith("http")) return previewUrl;
  return fallbackPublicUrl;
}

const SCAN_PREVIEW_KEY = "plantai_scan_preview";

// Guarda la vista previa del escaneo en sessionStorage
export function storeScanPreview(url) {
  sessionStorage.setItem(SCAN_PREVIEW_KEY, url);
}

// Obtiene la vista previa del escaneo de sessionStorage
export function getScanPreview() {
  return sessionStorage.getItem(SCAN_PREVIEW_KEY);
}

// Borra la vista previa del escaneo de sessionStorage
export function clearScanPreview() {
  sessionStorage.removeItem(SCAN_PREVIEW_KEY);
}

// Convierte una cadena DataURL Base64 en un objeto File
export function dataUrlToFile(dataUrl, filename = "scan.jpg") {
  if (!dataUrl || !dataUrl.startsWith("data:")) return null;
  try {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (err) {
    console.error("Error al convertir dataUrl a File:", err);
    return null;
  }
}

// Obtiene la imagen escaneada como objeto File
export function getScanPreviewFile(filename = "scan.jpg") {
  const dataUrl = getScanPreview();
  if (!dataUrl) return null;
  return dataUrlToFile(dataUrl, filename);
}
