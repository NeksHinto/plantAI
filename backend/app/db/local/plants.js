import { db } from "./pool.js";

// Obtiene las plantas de un ambiente con su último diagnóstico
export async function getPlantsByRoomId(roomId) {
  const res = await db.query(
    `SELECT p.id, p.user_id, p.room_id, p.name, p.common_name, p.species, p.image_url,
            h.diagnosis, h.accuracy
     FROM plants p
     LEFT JOIN LATERAL (
         SELECT diagnosis, accuracy 
         FROM plant_health_records 
         WHERE plant_id = p.id 
         ORDER BY created_at DESC 
         LIMIT 1
     ) h ON TRUE
     WHERE p.room_id = $1`,
    [roomId]
  );
  return res.rows;
}

// Obtiene los datos básicos de una planta por su ID
export async function getPlantById(plantId) {
  const res = await db.query(
    "SELECT id, user_id, room_id, name, common_name, species, image_url FROM plants WHERE id = $1",
    [plantId]
  );
  return res.rows[0];
}

// Obtiene el historial clínico de escaneos de una planta
export async function getHealthRecordsByPlantId(plantId) {
  const res = await db.query(
    "SELECT id, plant_id, diagnosis, accuracy, treatment_notes, created_at AS date FROM plant_health_records WHERE plant_id = $1 ORDER BY created_at DESC",
    [plantId]
  );
  return res.rows;
}

// Actualiza el nombre o el ambiente asignado a una planta
export async function updatePlant(plantId, name, roomId) {
  const res = await db.query(
    `UPDATE plants 
     SET name = COALESCE($1, name),
         room_id = COALESCE($2, room_id)
     WHERE id = $3
     RETURNING id, user_id, room_id, name, common_name, species, image_url`,
    [
      name !== undefined ? name : null,
      roomId !== undefined ? Number(roomId) : null,
      plantId
    ]
  );
  return res.rows[0];
}

// Registra una nueva planta en la base de datos
export async function insertPlant(userId, roomId, name, commonName, species, imageUrl) {
  const res = await db.query(
    "INSERT INTO plants (user_id, room_id, name, common_name, species, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, user_id, room_id, name, common_name, species, image_url",
    [userId, roomId, name, commonName || null, species, imageUrl]
  );
  return res.rows[0];
}

// Guarda un nuevo diagnóstico clínico para una planta
export async function insertHealthRecord(plantId, diagnosis, accuracy, treatmentNotes) {
  const res = await db.query(
    "INSERT INTO plant_health_records (plant_id, diagnosis, accuracy, treatment_notes) VALUES ($1, $2, $3, $4) RETURNING id, plant_id, diagnosis, accuracy, treatment_notes, created_at AS date",
    [plantId, diagnosis, accuracy, treatmentNotes || null]
  );
  return res.rows[0];
}

// Obtiene el contexto ambiental (temperatura e interior/exterior) de una planta
export async function getRoomContextByPlantId(plantId) {
  const res = await db.query(
    `SELECT r.id, r.temperature_level, r.is_indoors 
     FROM plants p 
     JOIN rooms r ON p.room_id = r.id 
     WHERE p.id = $1`,
    [plantId]
  );
  return res.rows[0];
}

// Elimina una planta y sus registros de diagnóstico asociados
export async function deletePlant(plantId) {
  const res = await db.query(
    "DELETE FROM plants WHERE id = $1 RETURNING id",
    [plantId]
  );
  return res.rows[0];
}

// Elimina un registro de salud por su ID
export async function deleteHealthRecord(recordId) {
  const res = await db.query(
    "DELETE FROM plant_health_records WHERE id = $1 RETURNING id",
    [recordId]
  );
  return res.rows[0];
}

// Actualiza las notas de tratamiento de un registro clínico
export async function updateHealthRecord(recordId, treatmentNotes) {
  const res = await db.query(
    "UPDATE plant_health_records SET treatment_notes = $1 WHERE id = $2 RETURNING id, plant_id, diagnosis, accuracy, treatment_notes, created_at AS date",
    [treatmentNotes, recordId]
  );
  return res.rows[0];
}

// Obtiene un registro de salud y verifica su usuario propietario
export async function getHealthRecordById(recordId) {
  const res = await db.query(
    `SELECT r.id, r.plant_id, p.user_id 
     FROM plant_health_records r 
     JOIN plants p ON r.plant_id = p.id 
     WHERE r.id = $1`,
    [recordId]
  );
  return res.rows[0];
}

