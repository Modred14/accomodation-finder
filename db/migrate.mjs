// db/migrate.mjs
// Applies db/schema.sql against DATABASE_URL. Run with: npm run db:migrate
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import pg from "pg";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
for (const file of [".env.local", ".env"]) {
  const p = path.join(root, file);
  if (existsSync(p)) dotenv.config({ path: p });
}
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const sql = readFileSync(path.join(__dirname, "schema.sql"), "utf8");

const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
});

async function main() {
  console.log("Applying schema.sql...");
  await pool.query(sql);
  console.log("Schema applied successfully.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
