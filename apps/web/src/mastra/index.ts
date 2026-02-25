import { Mastra } from '@mastra/core';
import { PostgresStore } from '@mastra/pg';
import { assistantAgent } from './agents/assistant';
import { getPool } from '@/lib/db';

export const mastra = new Mastra({
  agents: { assistantAgent },
  storage: new PostgresStore({ id: 'shipkit', pool: getPool() }),
});

export type AgentId = 'assistantAgent';
