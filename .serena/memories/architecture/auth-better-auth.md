# Better Auth Configuration

## Setup location
- Server config: `apps/web/src/lib/auth.ts` — exports `auth` instance.
- Client config: `apps/web/src/lib/auth-client.ts` — exports `authClient` for React components.
- API route: `apps/web/src/app/api/auth/[...all]/route.ts` — catch-all handler.
- Mobile: `apps/mobile/lib/auth-client.ts` — uses `expoClient` plugin with `expo-secure-store`.

## Server auth.ts pattern
```ts
import { betterAuth } from 'better-auth';
import { expo } from '@better-auth/expo';
import { getPool } from './db';

export const auth = betterAuth({
  database: { provider: 'pg', db: getPool() },
  plugins: [expo()],           // required for mobile clients
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  // ... optional providers below
});
```

## Making Resend optional
Do NOT import `resend` at the top level — use a dynamic import inside the send function:
```ts
const RESEND_KEY = process.env['RESEND_API_KEY'];
async function sendPasswordResetEmail(to, name, url) {
  if (RESEND_KEY) {
    const { Resend } = await import('resend');
    const resend = new Resend(RESEND_KEY);
    await resend.emails.send({ ... });
  } else {
    console.log(`[password-reset] Reset link for ${to}:\n${url}`);
  }
}
```

## Making Google OAuth optional
Spread conditional config into `betterAuth({...})` using `&&` and spread:
```ts
export const auth = betterAuth({
  // ...
  ...(process.env['GOOGLE_CLIENT_ID'] && process.env['GOOGLE_CLIENT_SECRET']
    ? { socialProviders: { google: { clientId: process.env['GOOGLE_CLIENT_ID'], clientSecret: process.env['GOOGLE_CLIENT_SECRET'] } } }
    : {}),
});
```

## Database tables
Run Better Auth migration once to create its tables:
```bash
cd apps/web && pnpm dlx better-auth@latest migrate
```
App-specific tables (e.g., `profiles`) go in `src/lib/db/schema.ts` and are managed by Drizzle.

## Auth hooks — auto-create profile
Use `databaseHooks.user.create.after` to create a matching row in the `profiles` table whenever a new Better Auth user is created.

## Route protection pattern
- No middleware-level redirect — `src/middleware.ts` is minimal (passes all requests).
- Auth is enforced at the component/page level by checking the session and calling `redirect()`.
- Mobile: use `expo-router` `(auth)` and `(app)` route groups with redirect logic in `_layout.tsx`.

## Session retrieval (server components)
```ts
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
const session = await auth.api.getSession({ headers: await headers() });
```
