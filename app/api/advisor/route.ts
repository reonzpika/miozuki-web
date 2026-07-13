import Anthropic from '@anthropic-ai/sdk';
import { getAdvisorSystemPrompt } from '@/lib/advisor/system-prompt';

/**
 * Streaming endpoint for the Miozuki jewellery advisor widget.
 *
 * Claude is reached through the LaoZhang API relay (docs.laozhang.ai), which
 * supports the Claude-native Messages format, so the Anthropic SDK works
 * unchanged with a baseURL override. Sonnet-tier model by default (Ryo's
 * 2026-07-13 call: Haiku answers read too weak for a fine-jewellery advisor),
 * capped output tokens, capped conversation length, and a best-effort per-IP
 * rate limit. The system prompt carries a cache_control breakpoint so repeat
 * traffic reads the prompt from cache where the relay supports it. Returns 503
 * when LAOZHANG_API_KEY is unset, so the widget (which the layout only renders
 * when the key exists) can never strand a customer.
 */

export const runtime = 'nodejs';

const MODEL = process.env.ADVISOR_MODEL || 'claude-sonnet-4-6';
// The relay's documented base for Claude-native calls; override if it changes.
const BASE_URL = process.env.ADVISOR_BASE_URL || 'https://api.laozhang.ai/v1';
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

/**
 * Live product search backed by Shopify's own Storefront MCP endpoint
 * (free, store-hosted, no token needed). The raw response is compacted to a
 * few lines per product so tool results stay cheap and the model can only
 * relay real titles, prices, and availability.
 */
const SHOPIFY_MCP_ENDPOINT = 'https://nassuu-px.myshopify.com/api/mcp';

const SEARCH_PRODUCTS_TOOL: Anthropic.Tool = {
  name: 'search_products',
  description:
    'Search the live Miozuki catalogue. Call this for any specific product question: budget limits (e.g. rings under $500), stone or style preferences, availability, or when the customer asks what you stock beyond the overview you already have. Returns real products with live NZD from-prices and availability.',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'Natural-language search, e.g. "moissanite stud earrings under 400 NZD" or "pearl necklace"',
      },
    },
    required: ['query'],
    additionalProperties: false,
  },
};

/**
 * Welcome-offer signup: the model may call this only after the customer typed
 * their email and agreed. Reuses the existing Klaviyo subscribe route (same
 * list and welcome flow as the popup), so consent and delivery behave
 * identically to the proven path.
 */
const SIGN_UP_TOOL: Anthropic.Tool = {
  name: 'sign_up_for_offer',
  description:
    'Subscribe the customer to the Miozuki list so they receive the NZ$15-off welcome code by email. Call ONLY after the customer has typed their email address in this conversation and clearly agreed to receive the offer.',
  input_schema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description: 'The email address the customer typed, exactly as given',
      },
    },
    required: ['email'],
    additionalProperties: false,
  },
};

async function signUpForOffer(email: string, requestUrl: string): Promise<string> {
  const trimmed = email.trim();
  if (!trimmed.includes('@') || trimmed.length > 254) {
    return 'That email address does not look valid; ask the customer to re-type it.';
  }
  try {
    const r = await fetch(new URL('/api/subscribe', requestUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: trimmed }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) return 'Signup failed; apologise and suggest the popup form or emailing info@miozuki.co.nz.';
    return 'Signed up successfully. The welcome code usually arrives within about 10 minutes.';
  } catch (err) {
    console.error('Advisor signup failed', err);
    return 'Signup failed; apologise and suggest the popup form or emailing info@miozuki.co.nz.';
  }
}

interface UcpProduct {
  title?: string;
  url?: string;
  price_range?: { min?: { amount?: number; currency?: string } };
  variants?: { availability?: { available?: boolean } }[];
}

async function searchLiveCatalogue(query: string): Promise<string> {
  if (!query.trim()) return 'No search query given.';
  try {
    const r = await fetch(SHOPIFY_MCP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'search_catalog',
          arguments: { query, context: 'Customer chatting with the Miozuki jewellery advisor' },
        },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) return 'Live search is unavailable right now.';
    const json = await r.json();
    const text: string | undefined = json?.result?.content?.[0]?.text;
    if (!text) return 'Live search returned no results.';
    const parsed = JSON.parse(text) as { products?: UcpProduct[] };
    const products = (parsed.products ?? []).slice(0, 6);
    if (products.length === 0) return 'No matching products found.';
    return products
      .map((p) => {
        const cents = p.price_range?.min?.amount;
        const price = typeof cents === 'number' ? `from NZ$${Math.round(cents / 100)}` : 'price at link';
        const path = p.url ? new URL(p.url).pathname : '';
        const available = p.variants?.some((v) => v.availability?.available !== false);
        return `- ${p.title ?? 'Untitled'}, ${price}, ${path}${available === false ? ' (currently unavailable)' : ''}`;
      })
      .join('\n');
  } catch (err) {
    console.error('Live catalogue search failed', err);
    return 'Live search is unavailable right now; answer from the catalogue overview and suggest browsing /collections/moissanite-nz.';
  }
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
  // The widget sends a sliding window of the last 12 turns; once a
  // conversation is long enough that window can start mid-exchange with an
  // assistant turn, which the API rejects (conversations must start with a
  // user message). Trim leading assistant turns instead of failing.
  while (out.length > 0 && out[0].role === 'assistant') out.shift();
  if (out.length === 0 || out[out.length - 1].role !== 'user') return null;
  return out;
}

export async function POST(request: Request) {
  if (!process.env.LAOZHANG_API_KEY) {
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

  const client = new Anthropic({
    apiKey: process.env.LAOZHANG_API_KEY,
    baseURL: BASE_URL,
  });
  const system = await getAdvisorSystemPrompt();

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // Manual tool loop (max 3 rounds): stream text as it arrives; when the
        // model calls search_products, run the live catalogue search and
        // continue. Live search grounds prices/availability in Shopify truth
        // instead of the hourly digest (the Air Canada ruling made hallucinated
        // chatbot prices a legal liability, not just a UX bug).
        const convo: Anthropic.MessageParam[] = [...messages];
        for (let round = 0; round < 3; round++) {
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
            tools: [SEARCH_PRODUCTS_TOOL, SIGN_UP_TOOL],
            messages: convo,
          });
          runner.on('text', (text) => {
            controller.enqueue(encoder.encode(text));
          });
          const final = await runner.finalMessage();
          if (final.stop_reason !== 'tool_use') break;

          convo.push({
            role: 'assistant',
            content: final.content as Anthropic.ContentBlockParam[],
          });
          const results: Anthropic.ToolResultBlockParam[] = [];
          for (const block of final.content) {
            if (block.type !== 'tool_use') continue;
            let content: string;
            if (block.name === 'sign_up_for_offer') {
              const email = String((block.input as { email?: unknown })?.email ?? '');
              content = await signUpForOffer(email, request.url);
            } else {
              const query = String((block.input as { query?: unknown })?.query ?? '');
              content = await searchLiveCatalogue(query);
            }
            results.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content,
            });
          }
          convo.push({ role: 'user', content: results });
        }
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
