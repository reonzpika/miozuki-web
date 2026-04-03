# Cursor UX/UI Re-Test — Miozuki (Round 2)

## What was fixed since round 1
1. **Add to cart broken** — cart mutations now use `NEXT_PUBLIC_` env vars (available client-side)
2. **`/collections/all` 404** — "View All" New Arrivals now links to `/collections`
3. **Mobile nav missing** — hamburger added with animated bars and slide-down menu
4. **Footer only on home page** — footer moved to layout, now global
5. **Cart badge hydration flash** — `suppressHydrationWarning` added

## Setup
`npm run dev` should already be running at `http://localhost:3000`.  
Test at **desktop (1280px)** and **mobile (375px)**.

---

## Focused re-test checklist

### A. Add to Cart (was: Critical fail)
1. Navigate to any product page `/products/[handle]`
2. Select a variant (if options exist)
3. Click **ADD TO CART**
4. **Expected:** button shows "Adding…" then "Added to Cart" for ~2s, then resets
5. **Expected:** cart icon in header shows a burgundy badge with count `1`
6. Click the cart icon
7. **Expected:** drawer slides in from right with the added item (image, name, price)
8. **Expected:** subtotal shown, "Checkout" button present
9. Click "Checkout"
10. **Expected:** navigates to Shopify hosted checkout URL (shopify.com domain)
11. Return, click "Remove" on the line item
12. **Expected:** item removed, empty state shown

### B. `/collections/all` link (was: Critical fail)
1. On home page, scroll to "New Arrivals" section
2. Click **View All** (top right of section)
3. **Expected:** navigates to `/collections` (collections list page), no 404

### C. Mobile nav (was: Major fail)
At **375px** viewport:
1. **Expected:** hamburger icon (3 animated bars) visible top-left
2. Tap hamburger
3. **Expected:** menu slides down showing "Collections" and "About" links
4. Tap "Collections"
5. **Expected:** navigates to `/collections`, menu closes
6. Return, open menu, tap hamburger again
7. **Expected:** menu closes, bars animate back to hamburger shape

### D. Global footer (new)
1. Check footer appears on: `/`, `/collections`, `/collections/[handle]`, `/products/[handle]`
2. **Expected:** "Miozuki" wordmark, nav links (Collections, About), copyright year
3. Footer links navigate correctly

### E. Cart badge (was: Minor — hydration flash)
1. Hard-refresh the page after having items in cart
2. **Expected:** badge briefly shows 0 or nothing, then updates to correct count within ~1s
3. **Expected:** no console error about hydration mismatch on the badge

---

## Regression checks (confirm still passing from round 1)
- [ ] Home page: cream background, hero, ornaments, collections grid, products grid
- [ ] Header: sticky, shadow on scroll, wordmark → home
- [ ] Collection PLP: hero, breadcrumb, sort/filter, product grid
- [ ] PDP: gallery thumbnails, variant selector, price in NZD format

---

## Reporting format
For each item A–E: **Pass**, **Partial** (describe what's still off), or **Fail** (describe exact behaviour).  
List any new issues found during the re-test, with severity: Critical / Major / Minor.
