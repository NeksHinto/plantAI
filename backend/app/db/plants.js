import { db } from "./pool.js";

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

export async function getPlantById(plantId) {
  const res = await db.query(
    "SELECT id, user_id, room_id, name, common_name, species, image_url FROM plants WHERE id = $1",
    [plantId]
  );
  return res.rows[0];
}

export async function getHealthRecordsByPlantId(plantId) {
  const res = await db.query(
    "SELECT id, plant_id, diagnosis, accuracy, treatment_notes, created_at AS date FROM plant_health_records WHERE plant_id = $1 ORDER BY created_at DESC",
    [plantId]
  );
  return res.rows;
}

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

export async function insertPlant(userId, roomId, name, commonName, species, imageUrl) {
  const res = await db.query(
    "INSERT INTO plants (user_id, room_id, name, common_name, species, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, user_id, room_id, name, common_name, species, image_url",
    [userId, roomId, name, commonName || null, species, imageUrl]
  );
  return res.rows[0];
}

export async function insertHealthRecord(plantId, diagnosis, accuracy, treatmentNotes) {
  const res = await db.query(
    "INSERT INTO plant_health_records (plant_id, diagnosis, accuracy, treatment_notes) VALUES ($1, $2, $3, $4) RETURNING id, plant_id, diagnosis, accuracy, treatment_notes, created_at AS date",
    [plantId, diagnosis, accuracy, treatmentNotes || null]
  );
  return res.rows[0];
}

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
