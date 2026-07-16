import { db } from "./pool.js";

export async function getUserByUsername(username) {
  const res = await db.query(
    "SELECT id, name, password FROM users WHERE username = $1",
    [username]
  );
  return res.rows[0];
}
