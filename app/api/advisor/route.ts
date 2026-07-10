import Anthropic from '@anthropic-ai/sdk';
import { getAdvisorSystemPrompt } from '@/lib/advisor/system-prompt';

/**
 * Streaming endpoint for the Miozuki jewellery advisor widget.
 *
 * Cost guardrails: Haiku-tier model by default (the recorded chatbot decision
 * caps spend at ~US$15/month under 1,000 chats), capped output tokens, capped
 * conversation length, and a best-effort per-IP rate limit. The system prompt
 * carries a cache_control breakpoint so repeat traffic reads the prompt from
 * cache. Returns 503 when ANTHROPIC_API_KEY is unset, so the widget (which the
 * layout only renders when the key exists) can never strand a customer.
 */

export const runtime = 'nodejs';

const MODEL = process.env.ADVISOR_MODEL || 'claude-haiku-4-5';
const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 1200;
const RATE_LIMIT_PER_MINUTE = 8;

// Best-effort per-instance rate limit; serverless instances each get their own
// map, which is acceptable for abuse damping at this store's traffic level.
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - 60_000;
  const recent = (hits.get(ip) ?? []).filter((t) => t > windowStart);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_LIMIT_PER_MINUTE;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function validMessages(body: unknown): ChatMessage[] | null {
  if (!body || typeof body !== 'object') return null;
  const messages = (body as { messages?: unknown }).messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return null;
  }
  const out: ChatMessage[] = [];
  for (const m of messages) {
    if (
      !m ||
      typeof m !== 'object' ||
      (m.role !== 'user' && m.role !== 'assistant') ||
      typeof m.content !== 'string' ||
      m.content.trim().length === 0 ||
      m.content.length > MAX_MESSAGE_CHARS
    ) {
      return null;
    }
    out.push({ role: m.role, content: m.content });
  }
  if (out[out.length - 1].role !== 'user') return null;
  return out;
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response('Advisor not configured', { status: 503 });
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    return new Response('Too many requests', { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const messages = validMessages(body);
  if (!messages) {
    return new Response('Invalid messages', { status: 400 });
  }

  const client = new Anthropic();
  const system = await getAdvisorSystemPrompt();

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const runner = client.messages.stream({
          model: MODEL,
          max_tokens: 700,
          system: [
            {
              type: 'text',
              text: system,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages,
        });
        runner.on('text', (text) => {
          controller.enqueue(encoder.encode(text));
        });
        await runner.finalMessage();
        controller.close();
      } catch (err) {
        console.error('Advisor stream failed', err);
        controller.enqueue(
          encoder.encode(
            'Sorry, I hit a snag just now. Please try again, or email info@miozuki.co.nz and we will help directly.'
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
