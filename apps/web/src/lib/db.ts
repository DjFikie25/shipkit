/**
 * PostgreSQL connection pool.
 *
 * Uses a module-level singleton so the pool is shared across hot reloads
 * in development (stored on `global`) and across requests in production.
 */
import { Pool } from 'pg';

declare global {
  // `var` is required in `declare global` — cannot use const/let
  var __pgPool: Pool | undefined;
}

/**
 * Strips `sslmode` and `channel_binding` from a Neon connection string and
 * returns a Pool config with the correct SSL settings.
 * Neon requires `ssl: { rejectUnauthorized: false }` when using the pooler.
 */
function neonPoolConfig(connectionString: string) {
  try {
    const url = new URL(connectionString);
    url.searchParams.delete('sslmode');
    url.searchParams.delete('channel_binding');
    return {
      connectionString: url.toString(),
      ssl: { rejectUnauthorized: false },
    };
  } catch {
    return { connectionString, ssl: { rejectUnauthorized: false } };
  }
}

export function getPool(): Pool {
  if (!process.env['DATABASE_URL']) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  if (!global.__pgPool) {
    global.__pgPool = new Pool(neonPoolConfig(process.env['DATABASE_URL']));
  }
  return global.__pgPool;
}

/** Run a SELECT query and return typed rows. */
export async function dbQuery<T>(sql: string, params?: unknown[]): Promise<T[]> {
  const { rows } = await getPool().query<T>(sql, params);
  return rows;
}

/** Run a SELECT query and return the first row or null. */
export async function dbQueryOne<T>(sql: string, params?: unknown[]): Promise<T | null> {
  const rows = await dbQuery<T>(sql, params);
  return rows[0] ?? null;
}

/** Run an INSERT/UPDATE/DELETE query with no meaningful return. */
export async function dbRun(sql: string, params?: unknown[]): Promise<void> {
  await getPool().query(sql, params);
}
