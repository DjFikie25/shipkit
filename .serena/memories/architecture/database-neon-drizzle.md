# Database: Neon PostgreSQL + Drizzle ORM

## Connection: `apps/web/src/lib/db.ts`

### Singleton pool pattern
The `pg.Pool` instance is stored in `global.__pgPool` to survive Next.js hot reloads in dev and to be shared across requests in production:
```ts
declare global { var __pgPool: Pool | undefined; }

export function getPool(): Pool {
  if (!process.env['DATABASE_URL']) throw new Error('DATABASE_URL environment variable is not set');
  if (!global.__pgPool) {
    global.__pgPool = new Pool(neonPoolConfig(process.env['DATABASE_URL']));
  }
  return global.__pgPool;
}
```

### Neon URL normalisation (`neonPoolConfig`)
Neon's pooled connection strings include `?sslmode=require&channel_binding=require` which the `pg` client cannot parse correctly. Strip them and set SSL manually:
```ts
function neonPoolConfig(connectionString: string) {
  const url = new URL(connectionString);
  url.searchParams.delete('sslmode');
  url.searchParams.delete('channel_binding');
  return { connectionString: url.toString(), ssl: { rejectUnauthorized: false } };
}
```
Always use `ssl: { rejectUnauthorized: false }` with Neon's pooler endpoint.

### Query helpers
- `dbQuery<T>(sql, params?)` — returns `T[]` rows.
- `dbQueryOne<T>(sql, params?)` — returns first row or `null`.
- `dbRun(sql, params?)` — INSERT/UPDATE/DELETE with no return.

## Schema: `apps/web/src/lib/db/schema.ts`
App-specific Drizzle tables (not Better Auth tables). Example:
```ts
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(),
  // ...
});
```

## Drizzle instance: `apps/web/src/lib/drizzle.ts`
```ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { getPool } from './db';
import * as schema from './db/schema';
export const db = drizzle(getPool(), { schema });
```

## Drizzle Kit config: `apps/web/drizzle.config.ts`
Manually parses `.env.local` for CLI usage (Drizzle Kit runs outside Next.js):
```ts
import { config } from 'dotenv';
config({ path: '.env.local' });
export default defineConfig({ schema: './src/lib/db/schema.ts', ... });
```

## Migration workflow
```bash
cd apps/web
# Better Auth tables (once)
pnpm dlx better-auth@latest migrate

# App tables (Drizzle)
pnpm db:generate   # creates SQL migration from schema.ts
pnpm db:migrate    # applies to Neon
pnpm db:studio     # Drizzle Studio UI
```

## Testing db.ts
Use `vi.hoisted()` + regular `function` for the Pool mock constructor. Must call `getPool()` explicitly in each test (pool is not created on import). Clear `globalThis.__pgPool = undefined` in `beforeEach`.
