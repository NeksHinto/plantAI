export const HEALTH_STATUS = {
  SALUDABLE: "saludable",
  ATENCION: "atencion",
  CRITICO: "critico",
  MEJORANDO: "mejorando",
  SALUD_OPTIMA: "salud-optima",
  ALERTA: "alerta",
};

// Imágenes placeholder hasta que el backend persista URLs reales
export const PLACEHOLDER_ROOM_INDOOR =
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=150&fit=crop";
export const PLACEHOLDER_ROOM_OUTDOOR =
  "https://images.unsplash.com/photo-1463320729081-f7551c9628f2?w=200&h=150&fit=crop";
export const PLACEHOLDER_PLANT =
  "https://images.unsplash.com/photo-1614594975524-03f902a553bd?w=200&h=200&fit=crop";

// TODO: reemplazar cuando el backend acepte upload de archivos (multipart/base64)
// PlantNet identify/species usa la URL en query string; data URLs exceden el límite
export const TEMP_PUBLIC_SCAN_IMAGE_URL =
  "https://images.unsplash.com/photo-1614594975524-03f902a553bd?w=800&h=800&fit=crop";
