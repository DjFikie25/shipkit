import { Mastra } from '@mastra/core';
import { PgMemory } from '@mastra/pg';
import { assistantAgent } from './agents/assistant';
import { getPool } from '@/lib/db';

export const mastra = new Mastra({
  agents: { assistantAgent },
  memory: new PgMemory({ pool: getPool() }),
});

export type AgentId = keyof typeof mastra['agents'];
