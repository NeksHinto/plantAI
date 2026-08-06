import { getStorageClient } from "../db/supabase/client.js";

const BUCKET = "plants";

/**
 * Object storage has no real directories — uploading path
 * `username-userId/file.jpg` creates that prefix automatically.
 */
export function userFolder(username, userId) {
  const safeUser = String(username || "user").replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${safeUser}-${userId}`;
}

export function plantImagePath(username, userId, plantId, roomId, ext = "jpg") {
  return `${userFolder(username, userId)}/${plantId}-${roomId}.${ext}`;
}

export function healthImagePath(username, userId, plantId, roomId, series, ext = "jpg") {
  return `${userFolder(username, userId)}/${plantId}-${roomId}-${series}.${ext}`;
}

export function parseDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const mimeType = match[1];
  const ext = mimeType.includes("png")
    ? "png"
    : mimeType.includes("webp")
      ? "webp"
      : "jpg";
  return {
    mimeType,
    ext,
    buffer: Buffer.from(match[2], "base64"),
  };
}

export async function uploadObject(objectPath, buffer, contentType) {
  const supabase = getStorageClient();
  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, buffer, {
    contentType: contentType || "image/jpeg",
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

/**
 * Uploads a data URL (or returns an existing http(s) URL unchanged).
 * Returns { publicUrl, path } or null if nothing usable.
 */
export async function resolveUpload(imageBase64OrUrl, objectPath) {
  if (!imageBase64OrUrl) return null;

  if (/^https?:\/\//i.test(imageBase64OrUrl)) {
    return { publicUrl: imageBase64OrUrl, path: null };
  }

  const parsed = parseDataUrl(imageBase64OrUrl);
  if (!parsed) return null;

  const path = objectPath.replace(/\.(jpg|jpeg|png|webp)$/i, `.${parsed.ext}`);
  const publicUrl = await uploadObject(path, parsed.buffer, parsed.mimeType);
  return { publicUrl, path };
}
