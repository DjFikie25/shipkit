# my-app-template — Monorepo Architecture

## Structure
```
my-app-template/
├── apps/
│   ├── web/          # Next.js 15 (App Router, Turbopack) — package: @template/web
│   └── mobile/       # Expo SDK 54 + React Native 0.76 — package: @template/mobile
├── packages/
│   ├── ui/           # Shared TypeScript utilities (cn, format) — package: @template/ui
│   └── api-client/   # Typed fetch wrapper — package: @template/api-client
├── AGENTS.md         # Full AI coding guidelines
├── turbo.json        # Turborepo task config
├── pnpm-workspace.yaml
└── .cursor/rules/project-guidelines.mdc
```

## Package Manager & Tooling
- **pnpm workspaces** (`pnpm-workspace.yaml`) with `apps/*` and `packages/*`.
- **Turborepo** (`turbo.json`) manages build/dev/test/lint pipelines with caching.
- `pnpm install` is ALWAYS required before any `pnpm dev` or `pnpm test` after fresh clone.
- `turbo` is installed as a root `devDependency` — not global — so `pnpm install` must run first.

## Key Dev Scripts (from root)
| Command | What it does |
|---|---|
| `pnpm dev` | Start all apps |
| `pnpm dev:web` | Web only (`turbo dev --filter=@template/web`) |
| `pnpm dev:mobile` | Mobile only |
| `pnpm build:web` | Build web only |
| `pnpm test` | Vitest across all packages (via Turbo) |
| `pnpm test:e2e` | Playwright E2E for web |

## Package Versions (as of template creation, Feb 2026)
- Next.js: 15.x (App Router, Turbopack, React Compiler experimental)
- Expo SDK: 54 / React Native: 0.76
- Better Auth: 1.4.x
- Mastra core: 1.7.x, Mastra pg: 1.6.x
- Tailwind CSS: 4.x
- NativeWind: 4.x
- Drizzle ORM: 0.43.x, Drizzle Kit: 0.31.x
- Vitest: 4.x, Playwright: 1.58.x
- pnpm: 9.x, Node: ≥ 20

## Turborepo Task Config (`turbo.json`)
- `build`: depends on `^build`, outputs `.next/**` and `dist/**`.
- `dev`: persistent, no cache.
- `test`: depends on `^build`, outputs `coverage/**`.
- `test:e2e`: no cache (Playwright).
- `clean`: no cache.

## Environment Variables
- `apps/web/.env.local` — web app secrets (copied from `.env.example`).
- `apps/mobile/.env.local` — mobile env (Expo public vars only).
- Required for local web dev: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `DATABASE_URL`, one AI provider key + `AI_PROVIDER` + `AI_MODEL`.
- Optional: `RESEND_API_KEY`/`RESEND_FROM_EMAIL` (falls back to console.log), `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`.
