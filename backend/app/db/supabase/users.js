import { supabase } from "./client.js";

export async function getUserByUsername(username) {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, password")
    .eq("username", username)
    .maybeSingle();

  if (error) throw error;
  return data;
}
