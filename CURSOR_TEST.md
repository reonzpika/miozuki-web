# Cursor UX/UI Testing — Miozuki Next.js Frontend

## Context
This is a headless Next.js 16 / React 19 / Tailwind v4 ecommerce frontend for Miozuki
(miozuki.co.nz), a NZ fine jewellery brand selling moissanite and pearl pieces.
It connects to a live Shopify store via Storefront API.

**Brand palette:** deep burgundy `#7B1E22`, cream `#F5F0E9`, charcoal text  
**Fonts:** Playfair Display (headings, serif), Inter (body)  
**Tone:** luxury minimalism — generous spacing, no gradients, subtle shadows

## Setup
1. `npm run dev` in this directory
2. Open `http://localhost:3000`
3. Test at both desktop (1280px+) and mobile (375px) viewport widths

---

## Test Plan

### 1. Home Page (`/`)
- [ ] Cream background loads (not white/grey)
- [ ] "MIOZUKI" wordmark appears in Playfair Display serif font
- [ ] Hero section fills viewport height with fade-up animation on load
- [ ] Decorative `◆` ornament visible above and below hero text
- [ ] Headline: "Crafted to Last. / *Made to Shine.*" — second line in italic
- [ ] Subtitle text visible and readable
- [ ] "SHOP COLLECTIONS" CTA button: burgundy background, cream text, no border radius
- [ ] Collections grid renders with real Shopify collection images (or cream placeholder if none)
- [ ] "New Arrivals" product grid renders with real product images and NZD prices
- [ ] Prices formatted as NZD (e.g. NZ$XXX.XX)
- [ ] Footer: brand name, tagline, copyright year

### 2. Header (all pages)
- [ ] Sticky — stays at top on scroll
- [ ] Shadow appears after scrolling 20px
- [ ] "MIOZUKI" links back to home
- [ ] "Collections" nav link visible on desktop, hidden on mobile
- [ ] Cart icon (bag SVG) on the right
- [ ] Cart badge (burgundy dot with count) appears after adding an item
- [ ] **Mobile (375px):** nav links hidden, wordmark and cart icon still visible

### 3. Collections List (`/collections`)
- [ ] Page title "Collections" in Playfair Display
- [ ] Grid of collection cards with images
- [ ] Hover: image zooms subtly, dark overlay appears with "View Collection" text
- [ ] Clicking a card navigates to the correct collection

### 4. Collection PLP (`/collections/[handle]`)
Pick a real collection handle from the store and navigate to it.
- [ ] Hero: collection image with dark overlay (or plain cream header if no image)
- [ ] Breadcrumb: Home / Collections / [Name]
- [ ] Product count shown (e.g. "12 pieces")
- [ ] Sort dropdown: Featured / Price Low-High / Price High-Low / A–Z
- [ ] Type filter dropdown: only shown if products have multiple types
- [ ] Sorting actually reorders the grid
- [ ] Product cards: image, title, NZD price
- [ ] Clicking a product navigates to its PDP

### 5. Product Detail Page (`/products/[handle]`)
Pick a real product handle and navigate to it.
- [ ] Breadcrumb: Home / Collections / [Product]
- [ ] Large main image displayed
- [ ] Thumbnail strip below (if product has multiple images) — clicking changes main image
- [ ] Product title in Playfair Display
- [ ] Price in burgundy
- [ ] Variant selectors rendered (e.g. Metal, Size) — if product has variants
- [ ] Selected variant highlighted in burgundy
- [ ] Sold-out variants greyed out and crossed through
- [ ] "ADD TO CART" button: burgundy, full width
- [ ] Button shows "Adding…" during request, then "Added to Cart" for 2s
- [ ] After adding, cart badge count increments in header
- [ ] Product description renders below the button
- [ ] Product tags shown as small bordered pills (if any)
- [ ] **Mobile:** gallery stacks above product info (not side by side)

### 6. Cart Drawer
- [ ] Clicking cart icon opens drawer from right
- [ ] Backdrop (dark overlay) appears behind drawer
- [ ] Drawer shows added item: image, product name, variant title, price × quantity
- [ ] "Remove" button removes the line item
- [ ] Subtotal shown
- [ ] "Checkout" button present — clicking it navigates to Shopify hosted checkout URL
- [ ] Closing: clicking backdrop, pressing Escape, or clicking ✕ all close the drawer
- [ ] Empty state: shows "Your cart is empty" with "Continue Shopping" link
- [ ] **Mobile:** drawer is full width

### 7. Navigation Flow
- [ ] All internal links navigate without full page reload (Next.js client nav)
- [ ] "View All" / "View All" links on home page work
- [ ] Back button works correctly

---

## Known Issues to Specifically Check
1. **Product descriptions** — HTML descriptions may not be styled (missing @tailwindcss/typography). Report whether they look broken or acceptable.
2. **Mobile nav** — Nav links (Collections, About) are hidden on mobile. Is the header still usable? Is there a hamburger menu needed?
3. **Cart count flash** — On hard refresh, cart count briefly shows 0 before rehydrating from localStorage. Is this noticeable?
4. **`/collections/all`** — Does this route work? (Shopify usually has a default "all" collection)
5. **Empty collections/products** — If any section is blank, note it (may indicate API token issue)

---

## Reporting Format
For each issue found, report:
- **Page/component:** e.g. "PDP / variant selector"
- **Viewport:** desktop or mobile
- **Issue:** what's wrong
- **Severity:** Critical (broken, can't use) / Major (bad UX) / Minor (cosmetic)
- **Suggested fix:** if obvious

After testing, produce a prioritised fix list with the most critical issues first.
