# Miozuki — Brand & UI/UX Design Audit
**Prepared for external brand review**
**Date:** April 2026
**Scope:** miozuki.co.nz — full website including brand identity, visual design, navigation, copy, and product experience

---

## Executive Summary

Miozuki is a Japanese-inspired fine jewellery brand based in Auckland, NZ, specialising in moissanite and pearl pieces. The brand has a genuinely distinctive origin story (a fortune slip at a Fukuoka shrine), a clear philosophical identity ("true beauty lives in contrast"), and a technically clean website built on a restrained, editorial aesthetic.

The design system is coherent and well-executed for an early-stage brand. The core visual identity — burgundy accent, cream background, Playfair Display headings, DM Sans body — works. The site is accessible, performant, and mobile-responsive.

The principal areas for improvement are:

- The brand operates on two separate registers (aspirational/poetic vs. SEO/transactional) that do not fully integrate
- There is no logomark: the brand has no symbol identity beyond a text wordmark
- The hero copy leads with SEO copy ("Modern Diamond Alternatives in NZ"), not brand copy
- The Japanese influence is stated but not visually expressed
- Several copy and structural decisions optimise for search/conversion at the cost of brand coherence

---

## 1. Brand Identity

### 1.1 Naming & Symbol

**The name is strong.** "Miozuki 澪月" (Waterway to the Moon) is poetic, distinctive, and brand-rich. It is not immediately legible to Western/NZ audiences phonetically, which is both a risk and a differentiator.

**The symbol is absent.** The current brand identity consists entirely of a text wordmark: "MIOZUKI" set in Playfair Display with `tracking-[0.2em]`. There is no logomark, no monogram, no graphic symbol in the codebase (`/public/` contains only Next.js/Vercel boilerplate SVGs). This creates significant limitations:

- No standalone icon for app icons, favicons, packaging, or social media profile images
- No brand mark that can appear on product photography without full wordmark
- No visual anchor point for brand recall

**Recommendation:** Develop a logomark. Candidates: a stylised water/moon motif, a kanji-derived symbol, a geometric abstraction of 澪月. The brand philosophy ("glow like the moon, flow like water") provides strong visual territory.

### 1.2 Japanese Identity vs. Visual Aesthetic

The brand has a deeply Japanese conceptual foundation: the name, the fortune slip origin story, the philosophical framework (contrast, duality, wabi-sabi resonance). However, the visual aesthetic is Western editorial minimalism — clean grids, cream backgrounds, Playfair Display, wide letter-spacing.

This is not necessarily a failure. The "Japanese-inspired" positioning is a lens, not a literal aesthetic. Mejuri is Canadian-founded and references no cultural visual tradition. The risk is inconsistency: when customers reach the About page and read the Japanese philosophy, then look at a cream website with Playfair Display, the visual language may not reinforce the story.

**Options to consider:**
1. Lean further West: drop the "Japanese-inspired" framing explicitly, let the brand speak for itself
2. Introduce subtle Japanese visual elements: asymmetric layouts, negative-space-forward compositions, a brush-stroke texture, a kanji detail as a decorative element
3. Current middle path: acceptable, but the gap should be a conscious choice, not an oversight

### 1.3 Color Palette

The six-token OKLCH palette is technically sophisticated and perceptually calibrated.

| Token | Value | Assessment |
|-------|-------|------------|
| `burgundy` | `oklch(0.33 0.10 15)` | Very dark, low-chroma wine-red. Reads close to black at small sizes. |
| `cream` | `oklch(0.96 0.010 75)` | Warm off-white. Excellent choice. |
| `charcoal` | `oklch(0.14 0 0)` | Near-black. Clean. |
| `surface` | `oklch(0.93 0.012 75)` | Very close to cream (Δ0.03 L). Risk of visual confusion. |
| `muted` | `oklch(0.55 0.015 75)` | Warm mid-grey. Functional. |
| `border` | `oklch(0.88 0.010 75)` | Subtle. On-brand. |

**The burgundy is problematic at its current value.** At L=0.33, it is nearly as dark as the charcoal (L=0.14). The intended effect — a warm, rich burgundy accent — is hard to perceive at fine scales. The cart badge, price display, and CTA links all use this colour. At 12px on a cream background, it reads as dark red-brown rather than wine-burgundy.

**Recommendation:** Lighten the primary burgundy to approximately `oklch(0.45 0.13 15)` for interactive elements, retaining the darker value for subtle decorative use. This will improve legibility and visual differentiation from charcoal.

### 1.4 Brand Tagline & Voice Consistency

Three separate brand statements appear across the site without a clear hierarchy:

1. "Miozuki 澪月 — Waterway to the Moon" (brand name meaning)
2. "True beauty lives in contrast" (brand philosophy, About page)
3. "Accessible luxury" (brand positioning, About page + homepage)

None of these function as a consistent tagline. The fortune slip copy ("even at the deepest part of the sea, if the water remains clear and still, the moonlight will always find its way to you") is the most emotionally resonant text in the entire site and appears on only one page.

**Recommendation:** Choose one headline brand statement and deploy it consistently. The moon/water metaphor is the most distinctive asset. "Accessible luxury" is the least differentiated — it is used by hundreds of mid-market brands.

---

## 2. Visual Design System

### 2.1 What Works

- The cream/burgundy/charcoal palette is internally consistent and applied without deviation
- The constraint on DM Sans weights (maximum 500, never bold) creates a refined, light register for body text
- Minimal use of shadows and rounded corners is correct for the brand category
- The `fade-up` entrance animation (24px translate, staggered at 100ms intervals) is subtle and elegant
- The `nav-underline` animation (underline offset 2px → 5px on hover) is a nice micro-interaction detail
- OKLCH color space is a technically strong choice — future-proof, perceptually uniform
- The scale-hover on product and collection images (500–700ms) feels measured, not aggressive

### 2.2 Issues

**Hero section separator motif is unused potential.** The diamond-and-line motif (`<div className="h-px w-10 bg-cream/40" /> <div className="w-1 h-1 bg-cream/50 rotate-45" />`) appears above and below the hero headline. This is a good brand detail — a small geometric mark that could become a visual signature. However, it exists only on the hero and is not developed into a design system element used elsewhere.

**AI-generated imagery in the "Accessible Luxury" section.** The full-bleed image in this section is sourced from `Generated_Image_October_03_2025.jpg` (Shopify CDN URL). This is editorial compromise. AI-generated imagery can look professionally neutral, but if it is identifiable as AI-generated, it undermines the authenticity of a brand built on a personal founder narrative. Brand and press professionals will likely notice this.

**Collection grid gaps on mobile.** The collections grid uses `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. On mobile, collections render as a single-column full-width grid, which works correctly but shows no more than 2–3 collections above the fold. Users on mobile may not scroll to discover the range.

**Product card design is functional, not aspirational.** The product card renders: square image → title in DM Sans text-sm → price in burgundy. This is clean but reads as utilitarian e-commerce rather than fine jewellery. Comparable brands (Mejuri, Monica Vinader) use larger imagery, hover product name reveals, or additional visual cues (material tag, stone type). The card design is the most prominent brand touchpoint in the shopping experience and is currently under-designed relative to the editorial homepage.

**The `surface` colour (oklch 0.93) is barely distinguishable from `cream` (oklch 0.96).** On a calibrated display the difference is approximately 3 perceptual lightness units. In practice this means card backgrounds and page background may appear identical to many users, making the depth/layering intention invisible.

---

## 3. Typography

### 3.1 Strengths

The Playfair Display / DM Sans pairing is a strong and well-established choice for this brand category — editorial, feminine, and appropriately aspirational. The use of `<em>` italic within headings (e.g., "meaning over *tradition*", "*Alternatives in NZ*") adds typographic life and creates rhythmic emphasis consistent with the brand voice.

### 3.2 Issues

**Hero headline (H1) is SEO copy, not brand copy.** The first thing a visitor reads is: "Modern Diamond Alternatives in NZ". This is an effective search-engine anchor phrase and a reasonable first-page SEO strategy. However, as a brand statement it positions Miozuki as a *substitute* product — "an alternative to diamond" — rather than as a primary luxury object with its own identity.

Comparable positioning approaches from Mejuri: "Fine jewellery, for every day." Monica Vinader: "Beautifully crafted pieces to wear every day." Neither brand leads with what they are an alternative to.

The brand's own copy — "for women who choose meaning over tradition", "true beauty lives in contrast" — is more distinctive and appears in the second section, after the fold.

**Body text is uniformly small (14px / text-sm).** The About, Founder, and policy pages use `text-sm` (0.875rem) for all body copy. This is below the widely accepted 16px baseline for comfortable reading of extended prose. The founder narrative in particular deserves more generous sizing — it is the emotional core of the brand and is currently rendered at the same size as shipping policy text.

**No clear typographic scale documentation.** Font sizes across the site range from `text-[9px]` (cart count badge) to `text-8xl` (hero, large viewport). The middle range (text-sm through text-2xl) contains inconsistently applied sizing across different contexts. The design system has motion tokens and color tokens, but no font-size scale tokens.

**H3 in product cards uses DM Sans, not Playfair.** The product name — the most prominent text in the shopping experience — is set in the body font. Every other section heading uses Playfair. This creates a tonal split: the editorial sections feel premium, the product sections feel generic e-commerce.

---

## 4. Information Architecture & Navigation

### 4.1 Structure

```
Best Sellers (direct link)
Shop All (dropdown: View All / Rings / Earrings / Pearl / Bridal)
Moissanite FAQ (direct link)
About (dropdown: About Miozuki / Our Founder)
```

### 4.2 Issues

**"Moissanite FAQ" is a primary navigation item.** Elevating an educational FAQ to the same navigation level as product collections tells the visitor, implicitly, that the product requires explanation before purchase. This is strategically unusual for a fine jewellery brand. Competitors do not surface "What is moissanite?" in their primary navigation — they embed that education within product pages, collection descriptions, and blog content.

The counter-argument: Miozuki's customer base may genuinely need education before converting, and the FAQ is well-written. If the FAQ-first positioning is a deliberate conversion strategy (reduce objections before browsing), that is defensible. If it is simply there because it's a useful page, it should move to the footer.

**"Best Sellers" as the first navigation item is commerce before brand.** This is a direct-response optimization, not a brand-building choice. The implication for first-time visitors: the first thing Miozuki tells them is what sells most. Luxury brands typically open with collections, new arrivals, or a brand-defining category.

**No Journal/Blog in the main navigation.** The blog is accessible via the footer and direct URL. This is content the brand could use to deepen the brand story, build SEO, and retain returning visitors. It is currently invisible to first-time users who do not read footers.

**The mobile navigation uses a fixed `max-h-[420px]`.** This constrains the mobile menu to a fixed height. Currently the 8 mobile nav items fit within this. Any navigation additions risk clipping the last items. The pattern should use content-driven height or explicit overflow handling.

**Collection URL handles expose internal taxonomy.** `/collections/all-moissanite-pearl-nz` is functional as a URL but reveals internal Shopify naming conventions. Premium brands typically use cleaner URLs: `/shop`, `/collections/jewellery`, etc.

---

## 5. Homepage Flow

### 5.1 Page Structure

```
1. Hero (full viewport, image + headline + CTA)
2. Brand Story (2-col: copy + founder portrait)
3. Collections Grid (6 collections)
4. Best Sellers (8 products)
5. Accessible Luxury (full-bleed image + CTA)
6. FAQ (accordion)
7. Instagram Feed (conditional)
8. Footer
```

### 5.2 Strengths

The hero-to-brand-story flow is logical. Visitors see the product aesthetic first, then immediately encounter the personal founder narrative. This sequences commerce before story, then deepens engagement for those who continue — a reasonable structure for a DTC brand with a strong founder identity.

The FAQ placement near the footer is a solid conversion-optimization choice: capture objections before the user exits.

### 5.3 Issues

**Hero has a single CTA ("Shop Now") with no secondary option.** Luxury brand websites typically offer two visitor journeys from the hero: one commerce-directed, one brand/story-directed. A user who is curious but not ready to purchase has no indicated path. "Discover Our Story" or "Our Jewellery" as a secondary option creates a lower-commitment entry point.

**The "Accessible Luxury" section does not advance the narrative.** This section appears between the collections/products and the FAQ. It uses a full-bleed image, a heading ("Fine jewellery for romantic moments to everyday elegance"), and a "Shop the Collection" CTA. This is a second commercial push, not a new emotional or informational beat. The page would read more coherently if this section were replaced with social proof (reviews/testimonials) or a deeper brand story moment.

**No social proof on the homepage.** Reviews are integrated via Judge.me but appear only on product detail pages. A featured testimonial, aggregate star rating, or customer story on the homepage would add purchase confidence, particularly for a product category (moissanite) where customer doubt is a conversion barrier.

**The brand story intro reads like a LinkedIn bio in the first line.** "Hi, I'm Ting Eguchi, founder of Miozuki" is direct and authentic, but the warm first-person intro sits awkwardly against the elevated brand copy that follows. The subsequent copy — "We are a small NZ jewellery brand, crafted with the idea of accessible luxury in mind" — undercuts the elevation of "true beauty lives in contrast." The two tones have not been fully unified.

**"Accessible luxury" is used verbatim three times** across the homepage and about page without deepening. It functions as a placeholder idea rather than a demonstrated value. Showing it — through specific price points, material callouts, or comparative statements — would strengthen it considerably.

---

## 6. Product Experience

### 6.1 Strengths

- Variant selector with disabled/unavailable states is clean and functional
- Add-to-cart state machine (idle → loading → added → error) is well-implemented
- Engraving input for rings adds meaningful personalisation
- Product gallery with thumbnail navigation works well
- Cart drawer interaction (right-slide, backdrop) is standard and appropriate
- Judge.me reviews integration provides third-party social proof

### 6.2 Issues

**Engraving limited to 4 characters.** This is a significant product design constraint. "LOVE", "ROSE", and initials with spaces can barely fit. Competitor brands offering custom engraving typically allow 10–20 characters. The constraint either reflects manufacturing limitations (which should be explained) or is an arbitrary technical limit that should be revisited.

**Product card design is under-designed relative to the editorial homepage.** When a user moves from the homepage into product browse (collections), the visual register changes from "editorial luxury" to "standard e-commerce grid." Product names are in a small body font, no material or stone information is visible on the card, and the only visual distinction from mid-market e-commerce is the scale-hover effect.

**No quick-view on collection pages.** Users browsing collections must navigate to each product page to see details. A quick-view modal or expanded hover state would reduce friction for comparison shopping without leaving the grid context.

**No size recommendation on product pages.** The ring size guide is accessible via a separate page and a modal, but there is no contextual prompt on ring product pages ("Not sure of your size? Order a ring sizer for $1"). This is a known conversion point for ring purchasing — unanswered sizing uncertainty leads to abandonment.

**No cross-sell or related products visible.** There is no "You might also like" or "Complete the look" section on product pages. For a brand with bridal positioning and limited SKUs, cross-selling complementary pieces (ring + earring) is a meaningful revenue opportunity.

---

## 7. Brand Voice & Copy

### 7.1 Strongest Copy Assets

The fortune slip quote is the best piece of writing on the site:

> "Even at the deepest part of the sea, if the water remains clear and still, the moonlight will always find its way to you."

This is distinctive, emotionally specific, and directly connected to the brand name. It appears once (About page) and should be a cornerstone brand asset used more widely — packaging, email, social, perhaps even a hero headline variant.

Other strong copy moments:
- "For women who choose meaning over tradition"
- "True beauty lives in contrast"
- "Glows like the moon, flows like water — graceful, yet unforgettable"
- The founder's lifestyle paragraph (journaling, rose tea, essential oils) — intimate and brand-consistent

### 7.2 Copy Issues

**The hero headline is SEO copy.** "Modern Diamond Alternatives in NZ" should exist for SEO purposes — as a page description, a meta title, or an H2 — but not as the first brand statement a visitor encounters. This is the single highest-impact copy change available. The brand has better material.

**"A touch of feminism and minimalism" (About page)** is ambiguous. "Feminism" used as a design/aesthetic descriptor rather than a political commitment is likely to confuse readers. The intent is probably "feminine sensibility" or "celebrating womanhood." This word needs to either be committed to and explained, or replaced.

**Timeline inconsistency in the brand story.** The homepage states the brand was born "after a fortune slip I picked at a shrine in Japan back in 2025." Product photography and CDN assets contain date strings from late 2024. If the brand launched before the Japan trip, the origin story as written is misleading. If the dates are metadata from a CDN and the trip was genuinely in 2025, this is fine — but the discrepancy is visible in the source code and worth verifying before sharing this site with press.

**The about page and founder page tell nearly the same story.** Both pages reference the fortune slip, the brand philosophy, and the founder's intent. A visitor who reads both will encounter significant content overlap. The about page should tell the *brand* story; the founder page should tell the *personal* story. Currently they blend.

**FAQ questions use a neutral, helpful tone** but no brand voice. "What material is used for Miozuki jewellery?" could be "What makes Miozuki pieces different?" The FAQ section is an opportunity to embed brand personality into a transactional content type, and it is currently missed.

---

## 8. Accessibility

### Strengths

- Full `prefers-reduced-motion` compliance via CSS media query (all transitions and animations disabled)
- `aria-label` on cart button with item count
- Semantic HTML throughout (`<header>`, `<nav>`, `<main>`, `<footer>`)
- `suppressHydrationWarning` on cart count (correct SSR handling)
- WCAG AA contrast ratios maintained for all primary text on cream background

### Issues

- No skip-to-content link at page top (keyboard navigation reaches the sticky header before main content)
- Hover-only interactions (collection card overlay, product card ring) are not accessible on touch devices — these are purely visual enhancements, but any text that appears only on hover is invisible to mobile users
- The "View All" CTA on collection/product sections uses `hidden md:block` — it is removed on mobile entirely, not moved or restated. Mobile users have no CTA to view all products from section headers
- Image alt text quality depends on Shopify data entry discipline. No alt-text validation or fallback beyond the product title
- Ring size guide modal: focus trapping and Escape key handling should be verified with assistive technology

---

## 9. Technical Observations Relevant to Brand

- No brand logo SVG exists in the codebase. The favicon is the default Next.js icon. This is a brand gap that extends to all browser tabs, bookmarks, mobile home screen icons, and social shares
- The Instagram token refresh runs on a server endpoint with long-lived Facebook user tokens — this is a single point of failure for the social feed. If the token expires silently, the Instagram section disappears with no fallback
- ISR revalidation on the homepage is set to 60 seconds — fine for standard use, but promotional/flash sale content may show stale pricing to some visitors
- The `revalidate = 60` pattern is correct for now; worth reviewing if the brand launches time-sensitive promotions

---

## 10. Priority Recommendations

The following are ordered by impact-to-effort ratio.

### Critical (brand integrity)

1. **Replace the hero headline.** "Modern Diamond Alternatives in NZ" is the most impactful single change. Replace with brand copy. Move the SEO phrase to an H2 or meta description. Suggested direction: a variant of "Waterway to the Moon" or "True beauty lives in contrast" — something from the brand's own vocabulary.

2. **Create a logomark.** Commission a symbol — even a minimal one. The water/moon territory is open and distinctive. This single asset unblocks packaging design, social profiles, email headers, favicon, and product swing tags.

3. **Replace the AI-generated image in the "Accessible Luxury" section.** This is a brand integrity risk. Replace with a real product photograph.

### High Priority (conversion and cohesion)

4. **Unify the brand voice register.** The homepage contains both "Hi, I'm Ting Eguchi, founder of Miozuki" (LinkedIn register) and "glows like the moon, flows like water" (editorial register). These need to speak in one voice. Elevate the intro copy to match the philosophy, or bring the philosophy copy to a warmer, more personal register.

5. **Add a secondary hero CTA.** Give non-purchase-ready visitors a path: "Our Story" or "Discover Miozuki" alongside "Shop Now."

6. **Move "Moissanite FAQ" from primary nav to footer.** Replace with "Journal" or a brand-relevant section. Evaluate whether the FAQ achieves its intended conversion goal in its current nav position or whether it can be surfaced via collection pages instead.

7. **Increase body text size on content pages.** About, Founder, and care guide pages carry the brand voice. Minimum 16px (1rem) for reading comfort. Currently at 14px.

### Medium Priority (product experience)

8. **Increase engraving character limit.** 4 characters is insufficient for meaningful personalisation. Extend to at least 10–15 characters if manufacturing allows.

9. **Add social proof to the homepage.** A single featured review, a star rating aggregate, or a short customer quote from Judge.me data would meaningfully reduce moissanite purchase hesitation.

10. **Redesign the product card for brand elevation.** Introduce the product name in Playfair Display, or add a material/stone type label. The card is the most repeated UI element and the current gap between homepage editorial quality and card quality is the largest visual inconsistency in the site.

11. **Add contextual ring sizing prompt on ring product pages.** "Not sure of your size? Order a $1 ring sizer — cost credited to your order." This converts a known abandonment point.

### Lower Priority (refinement)

12. **Lighten the burgundy accent** for interactive elements from `oklch(0.33)` to approximately `oklch(0.45)`. Improves legibility at small sizes without changing the brand palette.

13. **Increase `surface` lightness differential** from `cream` to create visible depth in card/page layering.

14. **Add favicon and Open Graph assets.** Currently using Next.js defaults. These appear in every browser tab and social share.

15. **Consider adding "Journal" to primary nav.** The blog content is useful SEO and brand-building content currently invisible from primary navigation.

---

## Appendix: Design System Reference

| Token | Value | Usage |
|-------|-------|-------|
| `burgundy` | `oklch(0.33 0.10 15)` | Accent, prices, CTAs, active states |
| `cream` | `oklch(0.96 0.010 75)` | Background, header, hero text |
| `charcoal` | `oklch(0.14 0 0)` | Primary text, headings |
| `surface` | `oklch(0.93 0.012 75)` | Card backgrounds |
| `muted` | `oklch(0.55 0.015 75)` | Secondary text, captions |
| `border` | `oklch(0.88 0.010 75)` | Dividers, subtle outlines |
| Font Display | Playfair Display | All headings, brand wordmark |
| Font Body | DM Sans (300/400/500) | All body, navigation, UI |
| Motion Fast | 150ms | Colour transitions |
| Motion Normal | 250ms | Nav underline, hovers |
| Motion Slow | 400ms | Drawer, cart, modals |

**Pages reviewed:** `/`, `/pages/about-us`, `/pages/our-founder`, `/pages/moissanite-faq`, `/pages/contact`, `/pages/size-guide`, `/policies/shipping-policy`, `/blogs/news`

**Components reviewed:** `header.tsx`, `footer.tsx`, `product-card.tsx`, `products-grid.tsx`, `cart-drawer.tsx`, `ring-size-guide.tsx`, `instagram-feed.tsx`, `add-to-cart.tsx`, `announcement-bar.tsx`

**Design system files reviewed:** `app/globals.css`, `app/layout.tsx`, `CLAUDE.md` (brand rules)

---

*This document is intended as input for brand strategy and design review. Findings are based on static code analysis; live user testing and analytics data may alter prioritisation.*
