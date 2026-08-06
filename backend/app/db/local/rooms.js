import { db } from "./pool.js";

const ROOM_COLS =
  "id, user_id, name, is_indoors, temperature_level, humidity_level, light_level";

export async function getRoomsByUserId(userId) {
  const res = await db.query(
    `SELECT ${ROOM_COLS} FROM rooms WHERE user_id = $1`,
    [userId]
  );
  return res.rows;
}

export async function updateRoom(
  roomId,
  name,
  isIndoors,
  temperatureLevel,
  humidityLevel,
  lightLevel
) {
  const res = await db.query(
    `UPDATE rooms 
     SET name = COALESCE($1, name),
         is_indoors = COALESCE($2, is_indoors),
         temperature_level = COALESCE($3, temperature_level),
         humidity_level = COALESCE($4, humidity_level),
         light_level = COALESCE($5, light_level)
     WHERE id = $6
     RETURNING ${ROOM_COLS}`,
    [
      name !== undefined ? name : null,
      isIndoors !== undefined ? isIndoors : null,
      temperatureLevel !== undefined ? temperatureLevel : null,
      humidityLevel !== undefined ? humidityLevel : null,
      lightLevel !== undefined ? lightLevel : null,
      roomId,
    ]
  );
  return res.rows[0];
}

export async function getRoomById(roomId) {
  const res = await db.query(`SELECT ${ROOM_COLS} FROM rooms WHERE id = $1`, [
    roomId,
  ]);
  return res.rows[0];
}

export async function insertRoom(
  userId,
  name,
  isIndoors,
  temperatureLevel,
  humidityLevel = null,
  lightLevel = null
) {
  const res = await db.query(
    `INSERT INTO rooms (user_id, name, is_indoors, temperature_level, humidity_level, light_level)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${ROOM_COLS}`,
    [userId, name, isIndoors, temperatureLevel, humidityLevel, lightLevel]
  );
  return res.rows[0];
}

export async function deleteRoom(roomId) {
  const res = await db.query("DELETE FROM rooms WHERE id = $1 RETURNING id", [
    roomId,
  ]);
  return res.rows[0];
}
