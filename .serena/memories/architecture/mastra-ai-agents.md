# Mastra AI Agent Architecture

## Setup
- Mastra instance: `apps/web/src/mastra/index.ts`
- Agents: `apps/web/src/mastra/agents/`
- API route: `apps/web/src/app/api/chat/route.ts` (streaming, POST)
- UI: `apps/web/src/components/chat/ChatWindow.tsx` (uses `@ai-sdk/react` `useChat` hook)

## Mastra initialisation
```ts
import { Mastra } from '@mastra/core';
import { PgMemory } from '@mastra/pg';
import { assistantAgent } from './agents/assistant';

export const mastra = new Mastra({
  agents: { assistantAgent },
  memory: new PgMemory({ connectionString: process.env['DATABASE_URL']! }),
});
```
`PgMemory` stores conversation history in Postgres — uses the same Neon DB.

## Agent definition
```ts
import { Agent } from '@mastra/core/agent';
import { getMastraModel } from '@/lib/ai-model';

export const assistantAgent = new Agent({
  name: 'Assistant',
  instructions: 'You are a helpful assistant...',
  model: getMastraModel(),  // e.g. 'groq/llama-3.3-70b-versatile'
});
```

## Adding a new agent
1. Create `apps/web/src/mastra/agents/my-agent.ts` with `new Agent({...})`.
2. Register in `apps/web/src/mastra/index.ts`: `agents: { assistantAgent, myAgent }`.
3. Call it from an API route: `mastra.getAgent('myAgent').stream(messages, { threadId })`.

## Chat API route pattern (streaming)
```ts
import { mastra } from '@/mastra';
import { toDataStreamResponse } from 'ai';

export async function POST(req: Request) {
  const { messages, threadId } = await req.json();
  const agent = mastra.getAgent('assistantAgent');
  const stream = await agent.stream(messages, { threadId });
  return toDataStreamResponse(stream);
}
```

## Mastra version notes
- `@mastra/core`: `^1.7.0` (not `0.x` — breaking change in API)
- `@mastra/pg`: `^1.6.1`
- Always verify latest: `npm view @mastra/core version` and `npm view @mastra/pg version`
- These versions change frequently; check before adding to a new project.

## Session / thread tracking
Pass `threadId` from the client (e.g., a UUID generated per chat session) to scope memory to that conversation. Mastra stores the thread in PgMemory.
