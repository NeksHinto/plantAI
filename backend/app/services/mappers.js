// mappers.js
export function mapPlantRow(row) { // TODO Review
  let status = "saludable";

  if (row.diagnosis) {
    const diagLower = row.diagnosis.toLowerCase();
    const isHealthyText = ["no disease", "sin enfermedad", "no se detect"].some(pattern =>
      diagLower.includes(pattern)
    );

    if (!isHealthyText) {
      const score = Number(row.accuracy ?? 0); // Certeza de enfermedad

      if (score >= 50) {
        status = "critico";
      } else if (score >= 15) {
        status = "atencion";
      } else {
        status = "saludable";
      }
    }
  }

  return {
    id: row.id,
    userId: row.user_id,
    roomId: row.room_id,
    name: row.name,
    species: row.species || "Especie desconocida",
    imageUrl: row.image_url,
    status
  };
}
