import { db } from "./pool.js";

export async function getPlantsByRoomId(roomId) {
  const res = await db.query(
    `SELECT p.id, p.user_id, p.room_id, p.name, p.species, p.image_url,
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
