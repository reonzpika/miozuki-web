# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this project is

Miozuki is a Shopify-backed fine jewellery storefront for a NZ brand (moissanite and pearl). Next.js 16 / React 19 / Tailwind v4, deployed to Vercel.

## Commands

```bash
npm run dev      # local dev server
npm run build    # production build
npm run lint     # ESLint
```

No test suite exists yet.

## Key architecture

### Data layer — three external APIs

**Shopify Storefront API** (`lib/shopify/`)
- `client.ts` — server-only RSC fetches with ISR (`next: { revalidate }`). Uses `SHOPIFY_STORE_DOMAIN` (no `NEXT_PUBLIC_` prefix).
- `cart.ts` — client-safe cart mutations (`cache: 'no-store'`). Uses `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` and `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`.
- `queries.ts` — all GraphQL query/mutation strings.
- `types.ts` — shared TypeScript interfaces.
- `index.ts` — re-exports from `client.ts`.

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
Fine jewellery — cream and burgundy, editorial, restrained luxury. References: Mejuri, Monica Vinader.

### Typography rules
- Headings: `font-serif` (Playfair Display), weight 700–800
- Body copy / UI: `font-sans` (DM Sans), weight 300 for prose, 500 for labels/prices
- Never use weight 700+ on DM Sans — wrong register for this brand
- Never use Inter, Roboto, Open Sans, or system font stacks

### Color rules
- Always use CSS tokens — never hardcode hex or rgb values
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
2. Use only tokens — no magic values
3. Every interactive element needs hover, focus-visible, and disabled states
4. Check 375px and 1440px breakpoints
5. Verify dark text on cream background meets 4.5:1 contrast (it does — do not lighten `--foreground`)

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
| `INSTAGRAM_USER_ID` | Instagram feed (server) — value: `17841475205382310` |
| `JUDGE_ME_PRIVATE_TOKEN` | Product reviews (server) |
