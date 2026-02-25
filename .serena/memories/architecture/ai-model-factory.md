# AI Model Factory Pattern

## File: `apps/web/src/lib/ai-model.ts`

## Design
A single file manages all AI provider selection. The provider and model are read from env vars at **module load time** (top-level constants), which means:
- No runtime overhead on each call.
- BUT: changing `AI_PROVIDER` requires a server restart (or `vi.resetModules()` in tests).

## Env vars
| Var | Default | Purpose |
|---|---|---|
| `AI_PROVIDER` | `groq` | Provider: `groq` / `openai` / `anthropic` / `google` |
| `AI_MODEL` | Provider default | Primary model name |
| `AI_MODEL_FAST` | Provider fast default | Cheap model for background tasks |

## Default models per provider
| Provider | Primary | Fast |
|---|---|---|
| groq | `llama-3.3-70b-versatile` | `llama-3.1-8b-instant` |
| openai | `gpt-4o` | `gpt-4o-mini` |
| anthropic | `claude-sonnet-4-5` | `claude-haiku-4-5` |
| google | `gemini-2.0-flash` | `gemini-2.0-flash-lite` |

## Exported functions
- `getModel()` — primary language model (AI SDK `LanguageModel`).
- `getFastModel()` — cheap model for summaries, background tasks.
- `getMastraModel()` — returns `"provider/model"` string for Mastra agent config.

## How providers are resolved
Uses `require()` inside a `switch` (not top-level import) so unused providers are not loaded:
```ts
function resolveModel(name: string) {
  switch (PROVIDER) {
    case 'openai': { const { openai } = require('@ai-sdk/openai'); return openai(name); }
    // ...
    default: { const { groq } = require('@ai-sdk/groq'); return groq(name); }
  }
}
```

## Mastra integration
Use `getMastraModel()` as the `model` string in `new Agent({ model: getMastraModel() })`.
Mastra expects the format `"provider/model-name"`.

## Swapping providers (no code changes)
1. Update `AI_PROVIDER` in `.env.local`.
2. Add the matching API key env var.
3. Optionally set `AI_MODEL` to override the default model.
4. Restart dev server.

## Testing gotcha
`PROVIDER` is a module-level constant. In Vitest:
- Use `vi.resetModules()` in `beforeEach`.
- Set `process.env['AI_PROVIDER']` BEFORE `await import('@/lib/ai-model')`.
- Use `delete process.env['AI_PROVIDER']` (not `= ''`) to test the default — `??` only triggers on `null`/`undefined`.
