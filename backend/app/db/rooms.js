import { db } from "./pool.js";

export async function getRoomsByUserId(userId) {
  const res = await db.query(
    "SELECT id, user_id, name, image_url, temperature_level, is_indoors FROM rooms WHERE user_id = $1",
    [userId]
  );
  return res.rows;
}

export async function updateRoom(roomId, name, isIndoors) {
  const res = await db.query(
    `UPDATE rooms 
     SET name = COALESCE($1, name),
         is_indoors = COALESCE($2, is_indoors)
     WHERE id = $3
     RETURNING id, user_id, name, image_url, temperature_level, is_indoors`,
    [
      name !== undefined ? name : null,
      isIndoors !== undefined ? isIndoors : null,
      roomId
    ]
  );
  return res.rows[0];
}
