//Procesa el texto directamente para evitar problemas de zona horaria (UTC vs Local).
export function formatDate(isoDate) {
  if (!isoDate) return "";

  // Extrae únicamente la parte de la fecha ("YYYY-MM-DD"), descartando la hora si existe
  const dateOnly = String(isoDate).split("T")[0];
  const parts = dateOnly.split("-");

  // Si la cadena tiene 3 partes [año, mes, día], arma el formato DD/MM/YY directamente
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year.slice(-2)}`;
  }

  // Resguardo (fallback): si viene en un formato distinto, usa el formateador nativo
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return String(isoDate);

  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

// Convierte a formato de hora de 24 hs (ej: "14:30").
export function formatTime(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

//Convierte un timestamp/ISO Date al formato completo de fecha y hora local de Argentina.
export function formatDateTime(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es-AR");
}

//Recibe un valor de temperatura (numérico o texto como "23.5°C") 
// y lo limpia para devolver un número decimal puro (ej: 23.5).
export function parseTemperature(val) {
  if (val === null || val === undefined || val === "") return null;
  const str = String(val).replace("°C", "").replace(",", ".").trim();
  const num = parseFloat(str);
  return Number.isNaN(num) ? null : num;
}

//Convierte un valor numérico de temperatura al formato estandarizado 
//para la base de datos con un decimal y el símbolo °C (ej: "23,5°C").
export function formatTemperatureForDb(val) {
  const num = typeof val === "number" ? val : parseTemperature(val);
  if (num === null || Number.isNaN(num)) return "";
  return `${num.toFixed(1).replace(".", ",")}°C`;
}