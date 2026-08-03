import { getSupabase } from "./client.js";

export async function getUserByUsername(username) {
  const { data, error } = await getSupabase()
    .from("users")
    .select("id, name, password")
    .eq("username", username)
    .maybeSingle();

  if (error) throw error;
  return data;
}
