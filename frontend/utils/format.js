export function formatDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year?.slice(2) ?? ""}`;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(2);
  return `${day}/${month}/${year}`;
}

export function formatTime(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export function formatDateTime(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleString("es-AR");
}

export function parseTemperature(val) {
  if (val === null || val === undefined || val === "") return null;
  const str = String(val).replace("°C", "").replace(",", ".").trim();
  const num = parseFloat(str);
  return Number.isNaN(num) ? null : num;
}

export function formatTemperatureForDb(val) {
  const num = typeof val === "number" ? val : parseTemperature(val);
  if (num === null || Number.isNaN(num)) return "";
  return `${num.toFixed(1).replace(".", ",")}°C`;
}

