/**
 * POST /api/chat
 *
 * Streaming chat endpoint backed by the AI SDK's streamText.
 * Compatible with the @ai-sdk/react useChat hook (data stream protocol).
 * Wide-event logging: one structured log per request.
 */
import { streamText } from 'ai';
import { getModel } from '@/lib/ai-model';
import { getServerUser } from '@/lib/auth';

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are a helpful, friendly AI assistant.
Be concise and direct. Format responses with markdown when it improves readability.
If you don't know something, say so rather than guessing.`;

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

    const body = await req.json() as { messages?: { role: string; content: string }[] };
    const messages = (body.messages ?? []) as { role: 'user' | 'assistant' | 'system'; content: string }[];

    event.message_count = messages.length;
    event.outcome = 'streaming';
    event.duration_ms = Date.now() - startTime;
    console.log(JSON.stringify(event));

    const result = streamText({
      model: getModel(),
      system: SYSTEM_PROMPT,
      messages,
    });

    return result.toDataStreamResponse();

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
