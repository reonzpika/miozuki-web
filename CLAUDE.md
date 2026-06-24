# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Audience

This file is for **Ryo's Claude Code (CLI) sessions**. Ryo has full repo access.

Cursor sessions belong to **Ting** and load `.cursor/rules/miozuki-strict.mdc`, which enforces locked files, a safe zone, and a Cursor-driven commit-and-push workflow. If you are Cursor reading this file via `@CLAUDE.md`, apply `.cursor/rules/miozuki-strict.mdc` instead. The strict rules are authoritative for Ting; CLAUDE.md is authoritative for Ryo.

**Assume the user is Ryo.** Ryo will identify himself explicitly if he is using Cursor for some reason. Do not ask the user to identify themselves at session start.

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

## Source of truth: Shopify for catalog, code for pages

The rule, by content type. One source per piece of content. Never maintain the same content in two places.

| Content type | Source of truth | Edited by | Mechanism |
|---|---|---|---|
| Products | Shopify | Ting | Storefront API, dynamic |
| Collections | Shopify | Ting | Storefront API, dynamic |
| Blog / news articles | Shopify | Ting | Storefront API, dynamic |
| Reviews | Judge.me | — | Judge.me |
| Pages — editorial (About, Our Founder) | **Code** (`app/pages/*`) | Ryo | Hardcoded JSX, bespoke layout |
| Pages — policies (shipping, returns, privacy, terms) | **Code** (`app/pages/*`, `app/policies/*`) | Ryo | Hardcoded JSX |
| Pages — marketing/structured (size guide, FAQ, custom-made, appointment, contact, care, warranty) | **Code** | Ryo | Hardcoded JSX |

Shopify owns all product, collection, and blog article content. Judge.me owns reviews. For catalog and blog content, the Next.js codebase is a pure view layer.

**Pages are the exception: code is canonical, not Shopify.** Every page lives in `app/pages/*` (or `app/policies/*`) as hardcoded JSX with a bespoke layout that a Shopify page-body HTML blob cannot reproduce. To change page copy, edit the JSX and deploy. Do NOT wire pages up to a Shopify `pages()` fetch, and do NOT edit page copy in Shopify admin.

**Transition state (as of 13 Jun 2026, Ryo):** this Next.js site is the in-development replacement for the current live Shopify storefront at `miozuki.co.nz`. The custom domain is intentionally still on Shopify; this app is served only on `*.vercel.app` until cutover. Strategy is **freeze Shopify, race to launch**: the Shopify Online Store pages are legacy, not maintained, and are accepted as-is (typos included) until launch. Do NOT delete the Shopify Pages or Settings > Policies entries during the transition, they still serve the live store. They are retired at cutover, when `miozuki.co.nz` is pointed at this Vercel project. Products, collections and blog content stay in Shopify throughout (shared backend, both storefronts read it).

When product, collection, or article content is wrong on the site, the fix goes in Shopify admin (or Judge.me for reviews). Do NOT add code that masks the problem. Specifically, avoid:

- Hardcoded text substitution maps that swap Shopify content (`*_REPLACEMENTS`, `*_OVERRIDES`, `*_CORRECTIONS`, `*_FIXUPS` arrays). We had one of these (`PDP_DESCRIPTION_REPLACEMENTS`) — it created drift, was removed.
- `onError` image fallbacks or hardcoded default images that hide broken Shopify CDN refs.
- Removing `notFound()` calls, removing try/catch around `getXByHandle` calls, or otherwise weakening the integration's failure surface.
- Converting `generateStaticParams` to a hardcoded handle list.

If you find yourself reaching for one of those, stop and ask whether the actual fix is in Shopify admin.

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

**Ting (content/UI changes, working directly on `master` via Cursor):**
- Ting does not write code, does not run terminal commands, and does not use git. Cursor edits files and publishes for her.
- All Ting's rules live in `.cursor/rules/miozuki-strict.mdc` (always-applied Cursor Project Rule). That file is authoritative for any Cursor session — locked files, safe zone, commit-and-push workflow, source-of-truth refusals.
- Ting commits land under Ryo's git identity. `git log` author alone does not reliably tell who made the change; check the commit message style or ask.
- Dev server starts automatically via VS Code task. Do not suggest `npm run dev` to her.

**Ryo (structural/feature changes, working on feature branches):**
- Normal branching workflow: branch → build → PR → merge to master
- Vercel generates a preview URL for every branch. Share these with Ting for approval before merging.
- The locked-files list in the Cursor strict rules does NOT apply to Ryo. Ryo may edit anything, with care.

## Commands

```bash
npm run dev              # local dev server
npm run build            # production build
npm run lint             # ESLint
npm run audit            # Playwright crawl: cart/checkout flows + broken images (docs/audit/)
npm run audit:lighthouse # Unlighthouse: site-wide Lighthouse (perf/a11y/SEO/best-practices)
```

No test suite exists yet.

**`npm run audit:lighthouse`** crawls the live site's sitemap and opens an interactive Lighthouse dashboard (config: `unlighthouse.config.ts`, mobile profile, `/admin` excluded). Override the target to audit a Vercel preview before shipping: `LIGHTHOUSE_SITE=<preview-url> npm run audit:lighthouse`. Concurrency is capped at 1 (higher crashes Chrome sessions on Windows; the full run is slower but stable). Reports write to `docs/audit/lighthouse/` (gitignored).

## Key architecture

### Data layer: four external APIs

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

**Resend** (`app/api/copy-review/route.ts`)
- Server-only. Sends the Ting copy-review submission email. Requires `RESEND_API_KEY` (set in Vercel Preview + Production).
- Sends from `noreply@clinicpro.co.nz` (a shared, verified ClinicPro Resend domain) to `ryo@clinicpro.co.nz`. Instantiate the client inside the handler, not at module scope, so a missing key never fails the build.

### Analytics & tracking

Three client-side trackers, each an env-gated component rendered in `app/layout.tsx`. Each returns `null` when its env var is unset, so a missing key never breaks the build. All three cover the **Next.js storefront only**: Shopify's hosted checkout is a separate domain (`checkout.miozuki.co.nz`) and is not tracked by these.

| Tool | Component | Env var | Purpose |
|---|---|---|---|
| Google Analytics 4 | `components/deferred-analytics.tsx` (via `@next/third-parties`, deferred) | `NEXT_PUBLIC_GA4_ID` | Traffic and behaviour stats |
| Meta (Facebook) Pixel | `components/meta-pixel.tsx` (`next/script`, `lazyOnload`) | `NEXT_PUBLIC_META_PIXEL_ID` | Ad attribution and conversion events for Meta ads |
| Microsoft Clarity | `components/clarity.tsx` (`next/script`, `lazyOnload`) | `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Heatmaps and session recordings |

**Keep this list current.** When adding a new tracker: create an env-gated client component mirroring `meta-pixel.tsx`, render it in `app/layout.tsx`, add the env var to Vercel (Production at minimum), and add a row above. `NEXT_PUBLIC_*` vars are inlined at build time, so a production redeploy is required before any change takes effect on the live site.

**Clarity specifics:**
- Dashboard: `clarity.microsoft.com`, Miozuki project. Recordings and heatmaps live there only.
- The Clarity Data Export API is wired into Ryo's Claude Code as the `clarity` MCP server (user scope), so Claude can pull aggregated stats on request. Limits: aggregated metrics only (no recordings), last 3 days per request, 10 requests/day.
- The Clarity API token lives only in Ryo's `~/.claude.json`, never in this repo.

### Error & uptime monitoring

Distinct from the trackers above (those are marketing analytics; these tell you when the store breaks).

- **Sentry** (errors + performance). Config lives in four root files: `instrumentation-client.ts` (browser), `sentry.server.config.ts`, `sentry.edge.config.ts`, and `instrumentation.ts` (registers the server/edge config per runtime and exports `onRequestError`). `next.config.ts` is wrapped with `withSentryConfig`. Every `Sentry.init` is env-gated on the DSN and is a **no-op when unset**, so local/preview builds without keys never send or break. `Sentry.captureException(error)` is wired into all five React error boundaries (`app/global-error.tsx` and the four route `error.tsx` files) alongside the existing `console.error`. Events are proxied through `tunnelRoute: '/monitoring'` to dodge ad-blockers. Env: `NEXT_PUBLIC_SENTRY_DSN` (publishable, client + server), optional `SENTRY_DSN` server override, and `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` at build time for source-map upload (build still succeeds without them, just minified traces). Dashboard: `sentry.io`.
- **OpenStatus** (external uptime). Monitors `www.miozuki.co.nz` and `checkout.miozuki.co.nz` from outside, emails on downtime. Monitors, alert channel, and the public status page are all configured in the OpenStatus dashboard, not in this repo. The admin Home tab shows an "Uptime status" link when `NEXT_PUBLIC_STATUS_PAGE_URL` is set. The in-app `checkSiteUp()` tile stays as the live glance; OpenStatus is the always-on alerting the in-app check cannot do (if the site is down, so is the admin).

### Admin charts & tables

The `/admin` Analytics and SEO tabs use **Recharts** for charts and a **TanStack Table** data-table for the top-N lists. The pages stay server components; charts and tables are `'use client'` child components fed serializable data (column definitions contain render functions, which cannot cross the server/client boundary, so each typed table lives client-side in `components/admin/tables.tsx`).

- **Charts:** `components/admin/charts/` (`visitor-trend`, `donut`, `search-trend`), shared brand colours + tooltip/date helpers in `format.ts`.
- **Tables:** `components/admin/tables.tsx` (typed `TopPagesTable` / `ChannelsTable` / `SearchQueriesTable` / `SearchPagesTable` wrapping a generic sortable `DataTable`), primitive in `components/ui/table.tsx`, `cn()` in `lib/utils.ts`.
- **shadcn note:** the table primitive follows the shadcn pattern but **`shadcn init` was deliberately NOT run** (it rewrites `globals.css` and clashes with the brand `@theme inline` tokens). The primitive uses the existing brand tokens (`border-border`, `text-graphite`, `bg-cream`, ...). Keep any future shadcn-style components on the brand tokens, not a parallel `--primary`/`--muted` system.

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
| `NEXT_PUBLIC_GA4_ID` | Google Analytics 4 (client) |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel (client) |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Microsoft Clarity heatmaps/recordings (client) |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error monitoring (client + server) |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | Sentry source-map upload (build time) |
| `NEXT_PUBLIC_STATUS_PAGE_URL` | OpenStatus public status-page link in admin |

### GraphQL codegen (Storefront type-safety)

Every Storefront query in `lib/shopify/` is validated against Shopify's published `2026-04` schema at build time, so a typo'd, renamed, or removed field **fails the build** instead of silently returning `undefined` on the live site.

- **Queries** live in `lib/shopify/queries.ts` and `lib/shopify/cart-backend.ts` as `/* GraphQL */`-tagged template literals. Fragments are **inlined** (no `${}` interpolation) so codegen can statically parse them. Keep that style: tag new queries with `/* GraphQL */` and inline any shared selections.
- **`npm run codegen`** (offline, also runs automatically via the `prebuild` script before `next build`): reads the committed schema SDL `lib/shopify/generated/storefront-schema.graphql`, validates all queries, and regenerates `lib/shopify/generated/storefront-types.ts` (operation result + variable types). Run it after editing any query; an invalid field aborts it (and the build).
- **`npm run codegen:schema`** (needs the Storefront token from `.env.local`, network): re-introspects the live API and rewrites the schema SDL. Run **only** when bumping `STOREFRONT_API_VERSION` in `lib/shopify/credentials.ts`.
- `lib/shopify/generated/**` is generated and committed; never hand-edit it (eslint-ignored). Config: `codegen.ts` + `codegen-schema.ts`.
- Scope note: this is Lean (validate + generate). Call sites still use the hand-written `lib/shopify/types.ts` shapes; adopting the generated types and covering the Admin API (`2024-10` scripts) are future passes.

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
