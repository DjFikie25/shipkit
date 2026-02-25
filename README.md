# ShipKit

A production-ready full-stack starter for Next.js + React Native projects. Clone this once,
fill in your secrets, and ship.

## What's included

| Layer | Technology |
|---|---|
| Web framework | Next.js 15 (App Router, Turbopack) |
| Mobile framework | Expo SDK 54 + React Native 0.76 |
| Auth | Better Auth 1.4 (email/password + Google OAuth + password reset) |
| Mobile auth | `@better-auth/expo` with SecureStore |
| Database | Neon PostgreSQL via `pg` + Drizzle ORM |
| AI chat | Mastra agents + AI SDK (streaming) |
| LLM providers | Groq · OpenAI · Anthropic · Google (env-driven, swap without code changes) |
| Email | Resend (password reset) |
| Styling (web) | Tailwind CSS v4 |
| Styling (mobile) | NativeWind v4 |
| Monorepo | pnpm workspaces + Turborepo |
| Unit tests | Vitest 4 (packages + web lib) |
| E2E tests | Playwright 1.58 (Chromium · Firefox · Mobile Chrome) |
| CI | GitHub Actions (lint → unit → build → E2E) |
| AI guidelines | AGENTS.md + Cursor rules embedding all Vercel best-practice skills |

---

## Quick start

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9 (`npm i -g pnpm`)
- A [Neon](https://neon.tech) PostgreSQL database
- At least one AI provider API key (Groq has a free tier: [console.groq.com](https://console.groq.com))

### 1. Clone & install

```bash
git clone https://github.com/chitamoor/shipkit my-app
cd my-app
pnpm install     # ← always required before pnpm dev
```

### 2. Configure the web app

```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in `apps/web/.env.local` — only the starred vars are required to get started:

```env
# ★ REQUIRED
BETTER_AUTH_SECRET=     # openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://...      # Neon pooled connection string
GROQ_API_KEY=gsk_...               # or OPENAI_API_KEY / ANTHROPIC_API_KEY
AI_PROVIDER=groq
AI_MODEL=llama-3.3-70b-versatile

# OPTIONAL — password reset emails (falls back to console.log in dev if not set)
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@yourdomain.com

# OPTIONAL — Google sign-in (omit to disable the Google button)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### 3. Set up the database

**Step A — Better Auth tables** (run once, in the Neon SQL editor or psql):

```bash
cd apps/web
pnpm dlx better-auth@latest migrate   # or paste the SQL from the Better Auth docs
```

**Step B — App tables** (Drizzle):

```bash
cd apps/web
pnpm db:generate    # generate migration SQL from schema.ts
pnpm db:migrate     # apply to Neon
```

### 4. Configure the mobile app (optional)

```bash
cp apps/mobile/.env.example apps/mobile/.env.local
```

```env
EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:3000   # device/emulator needs LAN IP, not localhost
```

Update `apps/mobile/app.json`:
- Change `slug`, `scheme`, `bundleIdentifier`, `package` to match your app.

### 5. Run

```bash
# Web
pnpm dev

# Mobile (separate terminal)
cd apps/mobile && pnpm dev
```

---

## Project structure

```
my-app-template/
├── apps/
│   ├── web/                   # Next.js 15
│   │   └── src/
│   │       ├── app/           # Routes (App Router)
│   │       │   ├── (auth)/    # signin, signup, set-new-password
│   │       │   ├── dashboard/ # authenticated home
│   │       │   ├── chat/      # AI chat UI
│   │       │   ├── api/auth/  # Better Auth catch-all
│   │       │   └── api/chat/  # streaming AI endpoint
│   │       ├── components/    # auth forms, ChatWindow
│   │       ├── lib/           # auth, db, drizzle, ai-model
│   │       └── mastra/        # agents + Mastra instance
│   └── mobile/                # Expo SDK 54
│       ├── app/
│       │   ├── (auth)/        # signin, signup screens
│       │   └── (app)/         # home + chat tabs (auth-gated)
│       └── lib/               # Better Auth Expo client
├── packages/
│   ├── ui/                    # Shared TypeScript utilities (cn, format)
│   └── api-client/            # Typed fetch wrapper for mobile → web API
├── AGENTS.md                  # Full AI coding guidelines (read this!)
└── .cursor/rules/             # Cursor IDE rules (auto-applied)
```

---

## Testing

### Unit tests (Vitest)

Run across all packages from the repo root:

```bash
pnpm test
```

Or watch mode while developing a single package:

```bash
pnpm --filter=@template/ui test:watch
pnpm --filter=@template/api-client test:watch
pnpm --filter=@template/web test:watch
```

Coverage reports land in `<package>/coverage/`.

### E2E tests (Playwright)

E2E tests live in `apps/web/e2e/` and require the web app running on port 3000.
Playwright will start the dev server automatically when you run:

```bash
pnpm test:e2e
```

Open the interactive Playwright UI for debugging:

```bash
pnpm --filter=@template/web test:e2e:ui
```

Install Playwright browsers on first run:

```bash
pnpm --filter=@template/web exec playwright install
```

#### What is tested

| Test file | Coverage |
|---|---|
| `e2e/landing.spec.ts` | Heading, CTA links, images, keyboard navigation |
| `e2e/auth.spec.ts` | Sign-in / sign-up form validation and error handling |
| `e2e/auth-guards.spec.ts` | Protected routes redirect, public routes are 200 |

### CI

GitHub Actions runs the full pipeline on every push and pull request to `main`/`develop`:

```
Lint & type-check → Unit tests → Build → E2E (Playwright)
```

See `.github/workflows/ci.yml`.

---

## Adding a new AI provider

1. Open `apps/web/.env.local`
2. Set `AI_PROVIDER=openai` (or `anthropic`, `google`)
3. Set the matching API key env var
4. Set `AI_MODEL` to the model name (e.g. `gpt-4o`)
5. Restart the dev server — no code changes needed

---

## Adding a new Mastra agent

```ts
// apps/web/src/mastra/agents/my-agent.ts
import { Agent } from '@mastra/core/agent';
import { getMastraModel } from '@/lib/ai-model';

export const myAgent = new Agent({
  name: 'My Agent',
  instructions: 'You are a specialist in...',
  model: getMastraModel(),
});
```

Register in `apps/web/src/mastra/index.ts`:

```ts
import { myAgent } from './agents/my-agent';

export const mastra = new Mastra({
  agents: { assistantAgent, myAgent },
  // ...
});
```

---

## Extending the database schema

Add tables to `apps/web/src/lib/db/schema.ts`, then:

```bash
cd apps/web
pnpm db:generate
pnpm db:migrate
```

---

## Google OAuth setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → Credentials → Create OAuth 2.0 Client
2. Add redirect URI: `http://localhost:3000/api/auth/callback/google` (and your production URL)
3. Copy Client ID + Secret into `apps/web/.env.local`
4. For mobile, also add your iOS Client ID to `apps/mobile/.env.local` as `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the `apps/web` directory in Vercel (set Root Directory to `apps/web`)
3. Add all env vars from `.env.example` in the Vercel dashboard
4. Update `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production domain
5. Add the production redirect URI to Google OAuth console

---

## License

MIT
