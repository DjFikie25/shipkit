/**
 * POST /api/chat
 *
 * Streaming chat endpoint backed by Mastra + AI SDK.
 * Persists conversation threads to PostgreSQL via PgMemory.
 * Wide-event logging: one structured log per request.
 */
import { createUIMessageStreamResponse } from 'ai';
import { getServerUser } from '@/lib/auth';
import { mastra } from '@/mastra';

export const maxDuration = 60;

export async function POST(req: Request) {
  const startTime = Date.now();
  const event: Record<string, unknown> = {
    route: 'POST /api/chat',
    timestamp: new Date().toISOString(),
  };

  try {
    const user = await getServerUser();
    if (!user) {
      event.outcome = 'error';
      event.error = 'Unauthorized';
      event.duration_ms = Date.now() - startTime;
      console.log(JSON.stringify(event));
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    event.user_id = user.id;

    const body = await req.json() as {
      messages: unknown[];
      threadId?: string;
      agentId?: string;
    };

    const agentId = (body.agentId ?? 'assistantAgent') as keyof typeof mastra['agents'];
    const threadId = body.threadId ?? `thread_${user.id}_${Date.now()}`;
    const messages = body.messages ?? [];

    event.agent_id = agentId;
    event.thread_id = threadId;
    event.message_count = messages.length;

    const agent = mastra.getAgent(agentId);

    const lastMessage = (messages[messages.length - 1] as { content?: string } | undefined)?.content ?? '';

    const stream = await agent.stream(String(lastMessage), {
      resourceId: user.id,
      threadId,
    });

    event.outcome = 'streaming';
    event.duration_ms = Date.now() - startTime;
    console.log(JSON.stringify(event));

    return createUIMessageStreamResponse({
      execute: (writer) => stream.pipeUIMessageStreamToResponse(writer),
    });

  } catch (err) {
    event.outcome = 'error';
    event.error = {
      type: err instanceof Error ? err.name : 'UnknownError',
      message: err instanceof Error ? err.message : String(err),
    };
    event.duration_ms = Date.now() - startTime;
    console.log(JSON.stringify(event));
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
