import { getSupabase } from "./client.js";

export async function getRoomsByUserId(userId) {
  const { data, error } = await getSupabase()
    .from("rooms")
    .select("id, user_id, name, image_url, temperature_level, is_indoors")
    .eq("user_id", userId);

  if (error) throw error;
  return data;
}

export async function getRoomById(roomId) {
  const { data, error } = await getSupabase()
    .from("rooms")
    .select("id, user_id, name, image_url, temperature_level, is_indoors")
    .eq("id", roomId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function insertRoom(userId, name, isIndoors) {
  const { data, error } = await getSupabase()
    .from("rooms")
    .insert({
      user_id: userId,
      name,
      is_indoors: isIndoors !== undefined ? isIndoors : true,
    })
    .select("id, user_id, name, image_url, temperature_level, is_indoors")
    .single();

  if (error) throw error;
  return data;
}

export async function updateRoom(roomId, name, isIndoors) {
  const fields = {};
  if (name !== undefined) fields.name = name;
  if (isIndoors !== undefined) fields.is_indoors = isIndoors;

  const { data, error } = await getSupabase()
    .from("rooms")
    .update(fields)
    .eq("id", roomId)
    .select("id, user_id, name, image_url, temperature_level, is_indoors")
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
