import { Agent } from '@mastra/core/agent';
import { getMastraModel } from '@/lib/ai-model';

export const assistantAgent = new Agent({
  name: 'Assistant',
  instructions: `You are a helpful, friendly AI assistant.
Be concise and direct. Format responses with markdown when it improves readability.
If you don't know something, say so rather than guessing.`,
  model: getMastraModel(),
});
