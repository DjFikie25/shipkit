import { drizzle } from 'drizzle-orm/node-postgres';
import { getPool } from '@/lib/db';
import * as schema from '@/lib/db/schema';

declare global {
  // `var` is required in `declare global` — cannot use const/let
  var __drizzleDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

function getDrizzle() {
  return drizzle(getPool(), { schema });
}

export const db: ReturnType<typeof getDrizzle> =
  global.__drizzleDb ?? (global.__drizzleDb = getDrizzle());

export { schema };
