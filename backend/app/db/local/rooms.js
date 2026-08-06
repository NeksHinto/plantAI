import { db } from "./pool.js";

// Obtiene todos los ambientes registrados por un usuario
export async function getRoomsByUserId(userId) {
  const res = await db.query(
    "SELECT id, user_id, name, image_url, temperature_level, is_indoors FROM rooms WHERE user_id = $1",
    [userId]
  );
  return res.rows;
}

// Actualiza los datos de un ambiente (nombre, ubicación, temperatura)
export async function updateRoom(roomId, name, isIndoors, temperatureLevel) {
  const res = await db.query(
    `UPDATE rooms 
     SET name = COALESCE($1, name),
         is_indoors = COALESCE($2, is_indoors),
         temperature_level = COALESCE($3, temperature_level)
     WHERE id = $4
     RETURNING id, user_id, name, image_url, temperature_level, is_indoors`,
    [
      name !== undefined ? name : null,
      isIndoors !== undefined ? isIndoors : null,
      temperatureLevel !== undefined ? temperatureLevel : null,
      roomId
    ]
  );
  return res.rows[0];
}

// Obtiene los datos de un ambiente por su ID
export async function getRoomById(roomId) {
  const res = await db.query(
    "SELECT id, user_id, name, image_url, temperature_level, is_indoors FROM rooms WHERE id = $1",
    [roomId]
  );
  return res.rows[0];
}

// Crea un nuevo ambiente para un usuario
export async function insertRoom(userId, name, isIndoors, temperatureLevel) {
  const res = await db.query(
    "INSERT INTO rooms (user_id, name, is_indoors, temperature_level) VALUES ($1, $2, $3, $4) RETURNING id, user_id, name, image_url, temperature_level, is_indoors",
    [userId, name, isIndoors, temperatureLevel]
  );
  return res.rows[0];
}

// Elimina un ambiente por su ID
export async function deleteRoom(roomId) {
  const res = await db.query(
    "DELETE FROM rooms WHERE id = $1 RETURNING id",
    [roomId]
  );
  return res.rows[0];
}
