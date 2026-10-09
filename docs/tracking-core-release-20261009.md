# Core tracking release, 9 October 2026

Ting authorised making the reviewed tracking repairs live. This release uses the existing Shopify, Google and Vercel setup. No external database, service account, paid plan, new purchase sender or Ads goal change is introduced.

Scope: Shopify privacy API and purpose-aware Google tag loading/queue reuse; supported visitor IDs and campaign freshness; serialised, confirmed cart attribute writes with bounded checkout wait; preservation of baskets after transient errors; product/list/cart/removal/checkout events and common item formatting; permission/click eligibility on the existing optional Ads upload with explicit consent and sanitised diagnostics.

Native Shopify remains the GA purchase owner. Existing custom Ads upload flag and Secondary destination remain unchanged. The existing uploader now refuses absent/denied permissions, including older orders without the new consent attributes. There is no retrospective replay.

The broader Admin reconciliation, durable delivery worker and Redis/cron drafts are excluded. A successful optional upload HTTP response remains distinct from proof of final Google processing. Domain/account configuration changes are also excluded.

Checks: scoped cart/privacy regression, actual-module webhook consent regression, TypeScript, lint and production build. The production public Storefront token was checked read-only against the correct Miozuki shop and matches the local public token. Independent review found no reproducible blocker in browser/cart scope or server consent changes. Record completed check/deployment evidence in the canonical tracking brain note at release sign-off.

After deployment, verify actual privacy initialisation, permitted Google tags, product/cart events, latest checkout handover and persisted attributes without submitting contact details or payment. A genuine eligible completed purchase outside staff filtering is still required for purchase/deduplication/currency and Ads attribution sign-off. Do not claim 99% future capture or present legitimate consent exclusions as defects.
