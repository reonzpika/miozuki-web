# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

Miozuki is a Shopify-backed fine jewellery storefront for a NZ brand (moissanite and pearl). Next.js 16 / React 19 / Tailwind v4, deployed to Vercel.

Next.js 16 has breaking changes from earlier versions. APIs, conventions, and file structure may differ from training data. Verify against `node_modules/next/dist/docs/` before trusting assumptions.

## Plan check

Before acting on any distinct objective, emit this visible checklist:

**Goal:** success in one sentence
**In scope:** what you will touch
**Out of scope:** what you will deliberately not touch
**Assumptions:** what you are taking as given (flag anything below 95% confidence)
**Options:** 2-4 approaches with tradeoffs, your lean noted
**Your approval:** explicit ask

If confidence on any assumption is below 95%, do not guess. Web search or ask the user.

Fire on: session opening, new objective mid-session, major direction change.
Skip for: trivial follow-ups within an already-approved plan.

## Irreversible actions

Before any of the following, emit a single-line confirmation and wait for "yes":
- File or folder deletion (`rm`, moves to trash)
- `git push`, force push, `git commit --amend`, `git reset --hard`
- Overwriting uncommitted work
- Scripts that trigger external side effects

This gate fires regardless of Plan check approval. Plan approval covers direction, not destructive moves.

## Analytical standards

- Stay unbiased. Do not let the user's stated preferences steer analysis.
- When pushed back on a proposal, evaluate honestly. Do not fold to be agreeable.
- Acknowledge uncertainty explicitly. If guessing, say so.
- Surface what the user does not know. Flag blind spots before commitment.
- When no ideal solution is clear, web search first. Do not settle for second-best when a better answer may exist. Check for new platform features, new libraries, new docs. Training data cuts off; the answer may have shipped after.

## Formatting rules (non-negotiable)

- New Zealand English: organise, behaviour, programme, etc.
- No em dashes. Use commas, colons, or restructure.
- Telegraph style: short sentences, no preamble, no padding.
- Bullet points for lists. Prose only when flow requires it.
- Lead with the answer.

## Team workflow

This project has two contributors with different workflows:

**Ting (content/UI changes, working directly on `master`):**
- Do not suggest creating branches, PRs, or terminal commands
- Do not suggest running `npm run dev`. The dev server starts automatically via VS Code task.
- Keep instructions simple: edit files, check localhost:3000, use Source Control panel to commit

**Ryo (structural/feature changes, working on feature branches):**
- Normal branching workflow: branch → build → PR → merge to master
- Vercel generates a preview URL for every branch. Share these with Ting for approval before merging.

## Commands

```bash
npm run dev      # local dev server
npm run build    # production build
npm run lint     # ESLint
```

No test suite exists yet.

## Key architecture

### Data layer: three external APIs

**Shopify Storefront API** (`lib/shopify/`)
- `client.ts`: server-only RSC fetches with ISR (`next: { revalidate }`). Uses `SHOPIFY_STORE_DOMAIN` (no `NEXT_PUBLIC_` prefix).
- `cart.ts`: client-safe cart mutations (`cache: 'no-store'`). Uses `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` and `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`.
- `queries.ts`: all GraphQL query/mutation strings.
- `types.ts`: shared TypeScript interfaces.
- `index.ts`: re-exports from `client.ts`.

The two Shopify clients are intentionally split: RSC reads go through `client.ts`, cart writes go through `cart.ts` directly from the browser.

**Instagram Graph API** (`lib/instagram/client.ts`)
- Server-only. Uses Facebook Graph API v21.0 (not `graph.instagram.com`).
- Requires `INSTAGRAM_ACCESS_TOKEN` (Facebook User Token) and `INSTAGRAM_USER_ID`.
- Token refresh endpoint: `GET /api/instagram/refresh-token`.

**Judge.me Reviews** (`lib/judgeme/client.ts`)
- Server-only. Shop domain is hardcoded: `nassuu-px.myshopify.com`.
- Requires `JUDGE_ME_PRIVATE_TOKEN`.

### Cart state

`CartProvider` in `components/cart-provider.tsx` is a React Context wrapping the entire app (mounted in `app/layout.tsx`). Cart ID is persisted in `localStorage` under the key `miozuki-cart-id`. On mount it rehydrates from Shopify via `getCart()`.

### Next.js 16 patterns in use

`params` in dynamic route segments is now `Promise<{ handle: string }>` and must be awaited:

```ts
export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
}
```

ISR is configured per-page with `export const revalidate = 60` (seconds).

### Tailwind v4

No `tailwind.config.js`. Theme is defined in `app/globals.css` with `@theme inline`. Custom tokens:

| Token | Value |
|-------|-------|
| `--color-burgundy` | `oklch(0.33 0.10 15)` |
| `--color-cream` | `oklch(0.96 0.010 75)` |
| `--color-charcoal` | `oklch(0.14 0 0)` |
| `--color-surface` | `oklch(0.93 0.012 75)` |
| `--color-muted` | `oklch(0.55 0.015 75)` |
| `--color-border` | `oklch(0.88 0.010 75)` |
| `--color-accent` | `oklch(0.33 0.10 15)` (= burgundy) |
| `--font-display` / `--font-serif` | Playfair Display |
| `--font-body` / `--font-sans` | DM Sans (weights 300/400/500 only) |

Use `font-serif` for headings, `font-sans` for body. The `fade-up` keyframe and `.article-prose` / `.nav-underline` utility classes are defined in `globals.css`.

Motion tokens: `--duration-fast` (150ms), `--duration-normal` (250ms), `--duration-slow` (400ms). Easing: `--ease-out`, `--ease-in-out`.

## Design System

### Brand aesthetic
Fine jewellery: cream and burgundy, editorial, restrained luxury. References: Mejuri, Monica Vinader.

### Typography rules
- Headings: `font-serif` (Playfair Display), weight 700–800
- Body copy / UI: `font-sans` (DM Sans), weight 300 for prose, 500 for labels/prices
- Never use weight 700+ on DM Sans. Wrong register for this brand.
- Never use Inter, Roboto, Open Sans, or system font stacks

### Color rules
- Always use CSS tokens. Never hardcode hex or rgb values.
- `--accent` / `--color-burgundy` for brand moments (links, borders, hover states)
- `--muted` for secondary text, captions, metadata
- `--surface` for card and panel backgrounds
- `--border` for dividers and input borders

### Banned patterns
- Three equal cards in a row
- Purple/blue gradients
- Heavy drop shadows (use border + surface elevation instead)
- Rounded corners > 8px on product imagery
- Emojis in UI

### UI workflow
1. Describe design direction before implementing
2. Use only tokens. No magic values.
3. Every interactive element needs hover, focus-visible, and disabled states
4. Check 375px and 1440px breakpoints
5. Verify dark text on cream background meets 4.5:1 contrast (it does; do not lighten `--foreground`)

### Reduced motion
The `prefers-reduced-motion` safety net is in `globals.css`. Never remove it. New animations must use the motion token variables (`--duration-*`, `--ease-*`).

## Route map

| Path | File |
|------|------|
| `/` | `app/page.tsx` |
| `/products/[handle]` | `app/products/[handle]/page.tsx` |
| `/collections/[handle]` | `app/collections/[handle]/page.tsx` |
| `/blogs/news/[handle]` | `app/blogs/news/[handle]/page.tsx` |
| `/pages/[slug]` | `app/pages/[slug]/page.tsx` |
| `/policies/shipping-policy` | `app/policies/shipping-policy/page.tsx` |
| `/api/instagram/refresh-token` | `app/api/instagram/refresh-token/route.ts` |

## Env vars

| Variable | Where used |
|----------|-----------|
| `SHOPIFY_STORE_DOMAIN` | Server RSC fetches |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Server RSC fetches |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | Client cart mutations |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Client cart mutations |
| `INSTAGRAM_ACCESS_TOKEN` | Instagram feed (server) |
| `INSTAGRAM_USER_ID` | Instagram feed (server), value: `17841475205382310` |
| `JUDGE_ME_PRIVATE_TOKEN` | Product reviews (server) |

### Shopify Storefront API tokens: sourcing and rotation

**The confusion.** Shopify has two dashboards that look like they might hold Storefront API credentials:
1. Partner Dashboard (`dev.shopify.com`) – contains OAuth Client ID and Client Secret for app distribution. NOT used for Storefront API calls.
2. Store admin (`admin.shopify.com/store/<handle>`) – contains the actual Storefront API tokens in the Sales channels panel.

**Correct location for Storefront tokens:** Store admin, Sales channels > Headless sales channel app (free, auto-installed) > Storefront panel. You will see:
- Public access token (32-char hex, or prefixed `shpat_`)
- Private access token (used only on server side for sensitive operations)
- List of available API permission scopes

**Token format heuristics:**
- 32-char hex (no prefix) or `shpat_` prefix = Storefront API token (public or private)
- `shpat_` prefix on Admin API section = Admin API token (different purpose, do not use for Storefront)
- `shpss_` prefix = OAuth API secret key (app distribution only, never for Storefront API calls)

**Identifying a stale token:** If all Storefront API queries fail with 401 Unauthorized (even `{shop{name}}`), the token is revoked or belongs to an uninstalled/deprecated app. Extract a fresh one from the Headless sales channel's Storefront panel.

**Token rotation (critical for production stability):**
1. Extract new tokens from Store admin > Sales channels > Headless > Storefront panel
2. Update `.env.local` locally: `SHOPIFY_STOREFRONT_ACCESS_TOKEN` (server, private token) and `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` (client, public token)
3. Update Vercel environment variables (project settings > Environment Variables) for the same two vars – must be updated in lockstep with local `.env.local`
4. Verify: run `npm run build` locally to confirm API connectivity before pushing
5. Commit and deploy. Vercel will pick up the new env vars on the next deployment.

## Coding standards

**Think before coding**
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them. Do not pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what is confusing. Ask.

**Simplicity first**
- Minimum code that solves the problem. Nothing speculative.
- No features beyond what was asked.
- No abstractions for single-use code.
- No error handling for impossible scenarios.
- If it took 200 lines and could be 50, rewrite it.
- Self-check: would a senior engineer say this is overcomplicated?

**Surgical changes**
- Touch only what you must.
- Do not improve adjacent code, comments, or formatting.
- Do not refactor things that are not broken.
- Match existing style, even if you would do it differently.
- Remove imports, variables, or functions that your changes made unused. Do not delete pre-existing dead code unless asked.
- Every changed line must trace directly to the user's request.

**Goal-driven execution**
- Transform tasks into verifiable goals:
  - "Add validation" becomes "Write tests for invalid inputs, then make them pass"
  - "Fix the bug" becomes "Write a test that reproduces it, then make it pass"
  - "Refactor X" becomes "Ensure tests pass before and after"
- For multi-step tasks, state a brief plan with a verification check per step.
