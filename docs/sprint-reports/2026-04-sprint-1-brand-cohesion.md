# Miozuki Sprint 1 + 1.5 — Brand Cohesion Pass

**Date**: 2026-04-08
**Branch**: `feat/sprint-1-quick-wins` (off `master`)
**Plan reference**: `~/.claude/plans/replicated-soaring-shell.md`
**Build status**: `npm run build` ✓ 81 static pages, `npm run lint` ✓ clean, `npx tsc --noEmit` ✓ clean

## Why this sprint exists

Miozuki has no sales yet and ads are about to scale. The owner moved 8 strategy and research docs into `docs/context/` and a brand audit at the repo root. Together those documents identify a gap between the current site and an "ad-ready" site. This sprint closes the code-only gaps so paid traffic does not land on a site that telegraphs early-stage.

Source documents this sprint draws from:

- `docs/context/miozuki-website-audit-2026.md` — 15-finding brand audit, the operational backlog
- `docs/context/Trust-building playbook for a zero-proof moissanite brand in New Zealand.md` — trust signal hierarchy for a category with high buyer scepticism
- `docs/context/Brand and website design standards for fine jewellery DTC brands.md` — typography, colour, motion conventions for the category
- `docs/context/Fine jewellery DTC competitive analysis 12 brands dissected.md` — what category leaders ship that we do not
- `docs/context/New Zealand fine jewellery DTC market a strategic landscape analysis.md` — NZ-specific positioning guardrails
- `docs/context/miozuki-top5-pre-ad-priorities-2026.md` — owner-prioritised quick wins
- `docs/context/moissanite research.md` — gemstone facts, Mohs/RI/colour grading sourcing
- `docs/context/miozuki-nano-banana-image-guide.md` — canonical Nano Banana image guide for this repo (2026-04-15 rename from `nano-banana-pro-research.md`)

---

## Sprint 1 — code-only quick wins

All eleven items below ship in one branch off `master`. None require external assets, gemologist outreach, or photography.

### §1.1 PDP shipping copy: free over $150 NZD

- **File**: `app/products/[handle]/page.tsx:152-157`
- **Change**: replaced the legacy "$8 NZD flat rate" paragraph with "Free NZ shipping on orders over $150 NZD via NZ Post tracked + signature. Orders under $150 ship for a flat $8. Typical delivery 2 to 7 business days (rural may take longer). Made-to-order items ship within ~4 weeks."
- **Why**: the brand audit (`miozuki-website-audit-2026.md`) and the trust playbook both flag free-shipping thresholds as a baseline buyer expectation in fine jewellery DTC. The competitive analysis confirmed all 12 benchmarked brands offer free shipping above a threshold. Owner has approved $150 NZD as the threshold and confirmed Shopify shipping rate change separately on the non-code track.

### §1.2 PDP trust strip below Add to Cart

- **New file**: `components/pdp-trust-strip.tsx` (server component)
- **Mount**: `app/products/[handle]/page.tsx`, directly under `<AddToCart />`
- **Change**: 4-cell strip showing "Free shipping $150+", "30-day returns", "Lifetime warranty", "Secure checkout". 2x2 mobile, 4-col desktop. Reuses SVG icon style from the homepage `DIFFERENTIATORS` array.
- **Why**: the trust playbook calls out "post-CTA reassurance band" as the single highest-leverage trust intervention on a PDP for a high-anxiety category. The competitive analysis showed all 12 benchmarked brands ship a variant of this strip. Audit finding B-3.

### §1.3 Stone data in PDP Materials accordion

- **File**: `app/products/[handle]/page.tsx:122-142`
- **Change**: pulled Materials out of the generic metafield map. It now always renders with a hard-coded `<dl>` fallback covering Mohs 9.25, RI 2.65, colour DEF, clarity VVS, AGS or IGI graded. If a Shopify metafield exists later, it overrides the fallback.
- **Compliance**: deliberately never mentions GRA anywhere. The audit explicitly flagged GRA as a discredited grader and the §6 non-code track will sweep Shopify product descriptions and blog content for GRA references separately.
- **Why**: `moissanite research.md` documents the gemological facts. The trust playbook argues the moissanite buyer's primary objection is "is this real?" and concrete, comparable, gemologist-level data is the single best response. Audit finding T-2.

### §1.4 Engraving character limit 4 to 12

- **File**: `components/add-to-cart.tsx`
- **Changes**: line 122 `slice(0, 4)` to `slice(0, 12)`; line 124 `maxLength={4}` to `12`; line 125 input width `w-28` to `w-52`; line 127 helper text "Max 4 characters" to "Max 12 characters".
- **Why**: 4 characters fits initials only. 12 fits a name, a date, or a short phrase, which is what the competitive analysis showed peers offer. Audit finding U-7.

### §1.5 Brand colour token tweaks

- **File**: `app/globals.css`
- **Changes**:
  - `--accent` lightness 0.33 → 0.45
  - `--accent-hover` lightness 0.27 → 0.38
  - `--color-burgundy` lightness 0.33 → 0.45 (matches `--accent`)
  - `--surface` lightness 0.93 → 0.90 (widens cream-vs-surface delta from 0.03 to 0.06)
- **Why**: the design standards doc and the audit both identify the previous burgundy as too dark to read against cream at small CTA sizes, and the surface colour as too close to cream to be visible as a band. Lifting burgundy by 12 OKLCH-L points keeps the brand identity but adds legibility headroom. Dropping surface by 3 points gives the homepage clear visual rhythm.

### §1.6 Move "Learn About Moissanite" out of nav

- **Files**: `components/header.tsx`, `components/footer.tsx`
- **Changes**:
  - Header: removed "Learn About Moissanite" child of Rings dropdown (line 16), pruned the now-unused `isDivider` logic (lines 146-149, 154), removed the mobile nav entry "Moissanite Guide" (line 52)
  - Footer: renamed "Moissanite FAQ" to "Learn About Moissanite" for naming consistency
- **Why**: the audit and the design standards doc both argue product-category navigation should contain only product categories. Educational links in primary nav signal an early-stage site to cold traffic. The footer is the conventional home for guides. Audit finding N-1.

### §1.7 NZ trust signals in footer

- **File**: `components/footer.tsx`
- **Changes**: added "Auckland, New Zealand" under social icons in the Brand column. Added "Proudly NZ-owned & operated" above the copyright bar. Left an inline TODO for the NZBN once registration completes (non-code track).
- **Why**: the NZ market analysis explicitly recommends location and ownership signals for NZ DTC, which buyers in this market actively seek as a counterweight to drop-ship operators. Audit finding L-1.

### §1.8 Wire contact form to Klaviyo Events

- **New files**: `app/api/contact/route.ts`, `components/contact-form.tsx` (client)
- **Edited**: `app/pages/contact/page.tsx`
- **Change**: replaced the inline mailto form with a real React form that POSTs to `/api/contact`. The route handler posts to `https://a.klaviyo.com/api/events/` with metric name "Contact form submission", profile attributes from the form. Reuses the existing `KLAVIYO_PRIVATE_KEY` env var (same one `app/api/subscribe/route.ts` uses).
- **Why**: the previous form was a `mailto:` link which loses the message on every device that does not have a configured mail client. The competitive analysis showed all 12 benchmarked brands have working contact forms. Reusing Klaviyo Events keeps the operational surface small (one tool, owner already monitors the dashboard) and unlocks a follow-up email automation. Audit finding U-3.
- **Action required**: confirm `KLAVIYO_PRIVATE_KEY` is set in Vercel project env vars (it is in `.env.local` already).

### §1.9 OpenGraph + Twitter metadata

- **File**: `app/layout.tsx:23-45`
- **Changes**: added `metadataBase: new URL('https://miozuki.co.nz')`, full `openGraph` block (title, description, url, siteName, type `website`, locale `en_NZ`, `images: ['/og-image.jpg']`), full `twitter` block (`card: 'summary_large_image'`, title, description, images).
- **Why**: without OG metadata, every social share, every messenger preview, every Slack unfurl, and every PR-pitch link looked like a broken or generic placeholder. This is the single highest-leverage 5-line change in the sprint. Audit finding L-3.
- **Asset**: `/og-image.jpg` is the magazine-masthead background generated in §5 below.

### §1.10 Replace AI-named hero image on homepage

- **File**: `app/page.tsx:163-190`
- **Change**: replaced `https://miozuki.co.nz/cdn/shop/files/Generated_Image_October_03_2025_-_1_19PM.jpg` with `/generated/accessible-luxury.jpg`. Updated the alt text to match the new composition.
- **Why**: the previous filename literally contained the string `Generated_Image` which is a brand-integrity smell on a moissanite trust-building site. The replacement was generated under the §5 sign-off gate using anti-AI-look prompt techniques. The new image is a still-life of cream linen, burgundy silk and a handmade ceramic vessel — mood only, no jewellery in frame, in line with the §5 scoping decision. Audit finding B-1.

### §1.11 Hero headline copy

- **File**: `components/hero-section.tsx:7-10`
- **Decision**: kept current copy "Fine jewellery / inspired by the moon" pending owner pick.
- **Alternatives**: "Waterway / to the Moon" (poetic, opaque for cold traffic). "True beauty / lives in contrast" (closer to pearl + moissanite duality).
- **Recommendation**: keep current for ad cold-traffic clarity. The audit recommends maximum legibility for the first 90 days of paid traffic.

---

## Sprint 1.5 — Nano Banana Pro image generation tooling

This is a separate scope from the code-only Sprint 1 items. It exists because §1.9 (OG image) and §1.10 (Accessible Luxury) both need new visual assets and the photography track is on the non-code parallel timeline. Per the §5 scoping decision in the plan, AI-generated imagery is approved for everything except product macros. The strategy docs explicitly warn that AI imagery on a moissanite site is a brand-integrity risk because the buyer's primary objection is "does it look real?". The mitigation is the §5.5 sign-off gate, applied to every generated image.

**Canonical reference (current path)**: `docs/context/miozuki-nano-banana-image-guide.md` — same content family: 7-part template (§2), photographic language (§3), anti-AI techniques (§4), hands (§5), screens (§6), Miozuki negative blocks (§7), iteration (§8), aspect ratios (§9), example prompt (§10), checklist (§11), laozhang.ai integration (§13). Renamed from `nano-banana-pro-research.md` on 2026-04-15.

### §5.2 Tooling installed

- **`scripts/gen-image.mjs`** (new) — Node 20+ ESM, no deps. Native `fetch`, `parseArgs` from `node:util`, `--env-file` for .env.local. CLI flags: `--prompt`, `--prompt-file` (multi-line markdown with optional YAML frontmatter), `--out`, `--aspect`, `--size`, `--model`, `--ref` (repeatable, max 14), `--help`. Defaults: `gemini-3.1-flash-image-preview`, 16:9, 2K. POSTs to `https://api.laozhang.ai/v1beta/models/{model}:generateContent`. Decodes the base64 image part from the response and writes the JPEG to `--out`.
- **`scripts/prompts/_templates.md`** (new) — 5 brand-locked starter scaffolds: Editorial mood band, Blog hero, Atmospheric brand background, OG card / typographic, Founder portrait stand-in. Each scaffold is intentionally incomplete to force the operator to re-read `docs/context/miozuki-nano-banana-image-guide.md` §2 / §3 / §4 / §7.1 / §11 and expand the scaffold to 250 to 500 words before generating. Top of file lists Miozuki-specific overrides: brand palette, editorial publication anchors (Kinfolk, Cereal, Vogue Italia, Wallpaper*, Monocle), film stocks, camera bodies, hand and jewellery negative constraints.
- **`scripts/prompts/<slot>.prompt.md`** — sidecar audit trail, one per generated image. YAML frontmatter (slot, purpose, model, aspect, size, template, reviewer, date) plus the full expanded prompt body. The `gen-image.mjs` script strips the frontmatter automatically when `--prompt-file` is used.
- **`public/generated/.gitkeep`** (new) — outputs land here, committed (not gitignored) because they ship as static assets.
- **`package.json`** — added `"gen-image": "node --env-file=.env.local scripts/gen-image.mjs"`.
- **`.env.local`** — `LAOZHANG_API_KEY=sk-...` (owner pasted; gitignored).

### §5.3 Generated assets — first batch

#### `public/generated/accessible-luxury.jpg`

- **Sidecar**: `scripts/prompts/accessible-luxury.prompt.md`
- **Specs**: 2528x1696, 3:2, 3.0 MB, gemini-3.1-flash-image-preview, single generation, ~34s
- **Subject**: cream linen still life with deep burgundy raw silk drape, handmade unglazed stoneware cup with chipped rim, oatmeal linen napkin. Composition offset to left third with quiet negative space on the right two thirds.
- **Reasoning**: Editorial mood band scaffold from `_templates.md`. Hasselblad H6D-50c with 80mm f/2.2, single warm window light from camera left at 30°, 4500K, no fill. Kodak Portra 400 colour grade. Visible film grain. Off-centre composition, single dust mote, asymmetric organic feel. Aspect 3:2 picked to match the existing `<Image width={2048} height={1366}>` declaration in `app/page.tsx`, which is 3:2.
- **Sign-off gate (§5.5)**: 3 of 4 passed. AI-tell sweep clean, brand palette in spec, real-photographer test passes. Owner sign-off pending.
- **Mounted at**: `app/page.tsx:166`

#### `public/generated/og-image.jpg`

- **Sidecar**: `scripts/prompts/og-image.prompt.md`
- **Specs**: 2752x1536, 16:9, 2.5 MB, gemini-3.1-flash-image-preview, single generation, ~28s
- **Subject**: flat magazine masthead background. Cream cotton-rag paper with subtle grain. Two thin burgundy hairlines top and bottom, each broken in the centre by a small four-pointed diamond lozenge ornament. Pure cream negative space in the central two thirds.
- **Reasoning**: OG card scaffold from `_templates.md`. Per image guide §6, on-image text is HIGH RISK for AI generation. Mitigation: generate the typographic background only and let `og:title` provide the brand name in the unfurl, or composite the wordmark later via `next/og` ImageResponse. Restricted to a strict two-colour palette (cream #F5F0E9 + burgundy #7B1E22) with massive negative-constraint block forbidding any letters, glyphs, monograms, or wordmarks.
- **Sign-off gate (§5.5)**: 3 of 4 passed. No hallucinated text, perfect two-colour palette, reads as a real flatbed scan of a magazine divider page. Owner sign-off pending.
- **Mounted in**: `app/layout.tsx` openGraph and twitter metadata blocks
- **Future upgrade path**: switch to a `next/og` dynamic route at `app/og-image/route.tsx` that composes the Playfair "Miozuki" wordmark on top of this background, if the owner wants the wordmark visible in unfurls instead of relying on `og:title` text.

### Cost so far

- 2 generations × ~$0.045 = ~$0.09 of the $1 sprint guardrail.

---

## Files changed (summary)

| File | Sprint item | Type |
|------|-------------|------|
| `app/products/[handle]/page.tsx` | §1.1 §1.2 §1.3 | edit |
| `components/add-to-cart.tsx` | §1.4 | edit |
| `app/globals.css` | §1.5 | edit |
| `components/header.tsx` | §1.6 | edit |
| `components/footer.tsx` | §1.6 §1.7 | edit |
| `app/pages/contact/page.tsx` | §1.8 | edit |
| `app/api/contact/route.ts` | §1.8 | new |
| `components/contact-form.tsx` | §1.8 | new |
| `app/layout.tsx` | §1.9 | edit |
| `app/page.tsx` | §1.10 | edit |
| `components/pdp-trust-strip.tsx` | §1.2 | new |
| `package.json` | §5.2 | edit |
| `scripts/gen-image.mjs` | §5.2 | new |
| `scripts/prompts/_templates.md` | §5.2 | new |
| `scripts/prompts/accessible-luxury.prompt.md` | §5.3 | new |
| `scripts/prompts/og-image.prompt.md` | §5.3 | new |
| `public/generated/.gitkeep` | §5.2 | new |
| `public/generated/accessible-luxury.jpg` | §5.3 / §1.10 | new |
| `public/generated/og-image.jpg` | §5.3 / §1.9 | new |
| `docs/context/miozuki-nano-banana-image-guide.md` | §5.1 | renamed / retargeted 2026-04-15 (was `nano-banana-pro-research.md`) |

---

## Pending owner decisions (block commit + push)

1. **§5.5 owner sign-off** on both generated images. Walk `accessible-luxury.jpg` and `og-image.jpg` and approve or reject. Per the gate, an image that fails twice falls back to a typographic or abstract treatment for that slot.
2. **§1.11 hero copy** pick. Default kept as current. Recommend keeping for ad clarity.
3. **§2.1 Afterpay merchant status** check in Shopify Payments. Sprint 2 blocker, not Sprint 1.
4. **Vercel env var** confirmation: `KLAVIYO_PRIVATE_KEY` must be set in the Vercel project env, not just `.env.local`, for `/api/contact` to work in production.
5. **NZBN registration status** for §1.7. Currently a TODO comment in the footer.

---

## What is NOT in this sprint

For traceability, the following audit findings are deliberately deferred to later sprints or to the non-code track:

- **Sprint 2** (`feat/sprint-2-metafields-xsell`, vault task `miozuki-20260408-006`): Afterpay badge, product card material tags + Playfair title, "Complete the Look" cross-sell, founder pull-quote band, sparkle video gallery slot
- **Phase 2** (multi-week): moissanite + pearl content hubs (10 articles total), photography integration, gemologist endorsement, founder review programme
- **Non-code track** (owner-led, parallel): Shopify shipping rate change, GRA term sweep, photography shoot booking, NZBN registration, gemologist outreach, founder review intake, press list build, copywriting briefs

---

## Verification

- `npm run build` — ✓ 81 static pages compiled, all routes prerendered correctly, `/api/contact` registered as dynamic
- `npm run lint` — ✓ clean
- `npx tsc --noEmit` — ✓ clean
- Smoke test (per plan §7) — pending owner walk on Vercel preview after commit + push
