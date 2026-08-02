import { createClient } from "@supabase/supabase-js";
import ws from "ws";

export const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY,
  {
    realtime: { transport: ws },
  }
);

export function getPublicStorageUrl(bucket, path) {
  return `${process.env.PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
