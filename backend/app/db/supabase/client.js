import { createClient } from "@supabase/supabase-js";

let dbClient;
let storageClient;

function buildClient(key) {
  return createClient(process.env.PUBLIC_SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function looksLikeJwt(key) {
  return typeof key === "string" && key.startsWith("eyJ") && key.split(".").length === 3;
}

/** Anon/publishable client for DB reads/writes (RLS as configured). */
export function getSupabase() {
  if (!dbClient) {
    dbClient = buildClient(process.env.PUBLIC_SUPABASE_ANON_KEY);
  }
  return dbClient;
}

/**
 * Privileged client for Storage uploads to bucket "plants".
 * PRIVATE_SUPABASE_BUCKET_API_KEY must be the service_role JWT
 * (Dashboard → Settings → API). S3 access keys will not work here.
 */
export function getStorageClient() {
  if (!storageClient) {
    const privateKey = process.env.PRIVATE_SUPABASE_BUCKET_API_KEY;
    const key = looksLikeJwt(privateKey)
      ? privateKey
      : process.env.PUBLIC_SUPABASE_ANON_KEY;

    if (privateKey && !looksLikeJwt(privateKey)) {
      console.warn(
        "[storage] PRIVATE_SUPABASE_BUCKET_API_KEY is not a service_role JWT (expected eyJ...). " +
          "Using anon key instead — Storage writes usually fail RLS."
      );
    } else if (!privateKey) {
      console.warn(
        "[storage] PRIVATE_SUPABASE_BUCKET_API_KEY missing — using anon key; Storage writes usually fail RLS."
      );
    }

    storageClient = buildClient(key);
  }
  return storageClient;
}
