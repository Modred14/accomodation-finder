// lib/db.js
import { Pool } from "pg";

// Neon (and most managed Postgres) requires SSL. `sslmode=require` in the
// connection string is usually enough, but we set `rejectUnauthorized: false`
// defensively for environments where the CA chain isn't preloaded.
const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV !== "test") {
  // Don't throw at import time in dev tooling (e.g. `next lint`), but make
  // the problem obvious the moment a query actually runs.
  console.warn(
    "[db] DATABASE_URL is not set. Add it to .env.local (see README.md)."
  );
}

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: connectionString?.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30_000,
    });
  }
  return pool;
}

/**
 * Run a parameterised SQL query against the pool.
 * @param {string} text
 * @param {any[]} params
 */
export async function query(text, params = []) {
  const client = getPool();
  const start = Date.now();
  const result = await client.query(text, params);
  if (process.env.DB_LOG === "1") {
    console.log("[db]", text.replace(/\s+/g, " ").trim(), `${Date.now() - start}ms`);
  }
  return result;
}

/**
 * Run several statements inside a single transaction.
 * @param {(client: import('pg').PoolClient) => Promise<any>} fn
 */
export async function withTransaction(fn) {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

const db = { query, withTransaction };
export default db;
