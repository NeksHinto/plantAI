import { getSupabase } from "./client.js";

const ROOM_COLS =
  "id, user_id, name, is_indoors, temperature_level, humidity_level, light_level";

export async function getRoomsByUserId(userId) {
  const { data, error } = await getSupabase()
    .from("rooms")
    .select(ROOM_COLS)
    .eq("user_id", userId);

  if (error) throw error;
  return data;
}

export async function getRoomById(roomId) {
  const { data, error } = await getSupabase()
    .from("rooms")
    .select(ROOM_COLS)
    .eq("id", roomId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function insertRoom(
  userId,
  name,
  isIndoors,
  temperatureLevel,
  humidityLevel = null,
  lightLevel = null
) {
  const { data, error } = await getSupabase()
    .from("rooms")
    .insert({
      user_id: userId,
      name,
      is_indoors: isIndoors,
      temperature_level: temperatureLevel,
      humidity_level: humidityLevel,
      light_level: lightLevel,
    })
    .select(ROOM_COLS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateRoom(
  roomId,
  name,
  isIndoors,
  temperatureLevel,
  humidityLevel,
  lightLevel
) {
  const fields = {};
  if (name !== undefined) fields.name = name;
  if (isIndoors !== undefined) fields.is_indoors = isIndoors;
  if (temperatureLevel !== undefined) fields.temperature_level = temperatureLevel;
  if (humidityLevel !== undefined) fields.humidity_level = humidityLevel;
  if (lightLevel !== undefined) fields.light_level = lightLevel;

  const { data, error } = await getSupabase()
    .from("rooms")
    .update(fields)
    .eq("id", roomId)
    .select(ROOM_COLS)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteRoom(roomId) {
  const { data, error } = await getSupabase()
    .from("rooms")
    .delete()
    .eq("id", roomId)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return data;
}
