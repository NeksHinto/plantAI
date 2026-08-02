import { supabase } from "./client.js";

function withDateAlias(record) {
  return { ...record, date: record.created_at };
}

export async function getPlantsByRoomId(roomId) {
  const { data, error } = await supabase
    .from("plants")
    .select(
      "id, user_id, room_id, name, common_name, species, image_url, plant_health_records(diagnosis, accuracy, created_at)"
    )
    .eq("room_id", roomId)
    .order("created_at", { referencedTable: "plant_health_records", ascending: false });

  if (error) throw error;

  return data.map(({ plant_health_records, ...plant }) => ({
    ...plant,
    diagnosis: plant_health_records?.[0]?.diagnosis,
    accuracy: plant_health_records?.[0]?.accuracy,
  }));
}

export async function getPlantById(plantId) {
  const { data, error } = await supabase
    .from("plants")
    .select("id, user_id, room_id, name, common_name, species, image_url")
    .eq("id", plantId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getHealthRecordsByPlantId(plantId) {
  const { data, error } = await supabase
    .from("plant_health_records")
    .select("id, plant_id, diagnosis, accuracy, treatment_notes, created_at")
    .eq("plant_id", plantId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map(withDateAlias);
}

export async function updatePlant(plantId, name, roomId) {
  const fields = {};
  if (name !== undefined) fields.name = name;
  if (roomId !== undefined) fields.room_id = Number(roomId);

  const { data, error } = await supabase
    .from("plants")
    .update(fields)
    .eq("id", plantId)
    .select("id, user_id, room_id, name, common_name, species, image_url")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function insertPlant(userId, roomId, name, commonName, species, imageUrl) {
  const { data, error } = await supabase
    .from("plants")
    .insert({
      user_id: userId,
      room_id: roomId,
      name,
      common_name: commonName || null,
      species,
      image_url: imageUrl,
    })
    .select("id, user_id, room_id, name, common_name, species, image_url")
    .single();

  if (error) throw error;
  return data;
}

export async function insertHealthRecord(plantId, diagnosis, accuracy, treatmentNotes) {
  const { data, error } = await supabase
    .from("plant_health_records")
    .insert({
      plant_id: plantId,
      diagnosis,
      accuracy,
      treatment_notes: treatmentNotes || null,
    })
    .select("id, plant_id, diagnosis, accuracy, treatment_notes, created_at")
    .single();

  if (error) throw error;
  return withDateAlias(data);
}

export async function getRoomContextByPlantId(plantId) {
  const { data, error } = await supabase
    .from("plants")
    .select("rooms(id, temperature_level, is_indoors)")
    .eq("id", plantId)
    .maybeSingle();

  if (error) throw error;
  return data?.rooms ?? null;
}

export async function deletePlant(plantId) {
  const { data, error } = await supabase
    .from("plants")
    .delete()
    .eq("id", plantId)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteHealthRecord(recordId) {
  const { data, error } = await supabase
    .from("plant_health_records")
    .delete()
    .eq("id", recordId)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateHealthRecord(recordId, treatmentNotes) {
  const { data, error } = await supabase
    .from("plant_health_records")
    .update({ treatment_notes: treatmentNotes })
    .eq("id", recordId)
    .select("id, plant_id, diagnosis, accuracy, treatment_notes, created_at")
    .maybeSingle();

  if (error) throw error;
  return data ? withDateAlias(data) : null;
}
