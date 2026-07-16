import pg from "pg";
const { Pool } = pg;

export const db = new Pool({
  user: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASS ?? "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: process.env.DB_PORT ?? 5432,
  database: process.env.DB_NAME ?? "postgres",
});
