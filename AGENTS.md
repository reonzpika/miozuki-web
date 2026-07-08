# Miozuki Web

This is the customer-facing Miozuki website. Real customers may see changes shortly after they are made live.

## Which rules to follow

- If the user is Ting or does not explicitly say they are Ryo, follow `.cursor/rules/miozuki-strict.mdc`.
- If the user explicitly says they are Ryo, follow `CLAUDE.md`.
- If instructions conflict, Ting's strict Cursor rules win for Ting sessions.

## Ting communication preference

For Ting sessions: fix technical issues in the background and reply outcome-first (what changed, saved or live, one next step if needed). Do not narrate lint, build, git, or recovery steps unless she asks. See **Outcome-first** in `.cursor/rules/miozuki-strict.mdc`.

## Safe sync reminder

- Before website work, run `npm run sync:safe`.
- This may update or merge the local copy, but it never makes the site live.
- After Ting says "make it live", use `npm run sync:publish`.
- Never run `npm run dev` directly while Cursor may already have the preview running. Use `npm run dev:restart` once if the preview is stuck.

## End-of-session records

Before finishing meaningful website work, do a quick records check.

- If the work changed a legal or policy page, follow the strict rule and add a dated note to `docs/cursor-followups.md` for Ryo.
- If the work revealed a durable marketing, SEO, brand, or customer-experience decision that belongs in `miozuki-brain`, tell Ting plainly and update the brain only when the task includes that work or Ting approves it.
- Do not copy product, collection, blog, price, inventory, review, or Shopify-owned content into code or into the brain as a workaround. Those facts live in Shopify or Judge.me.
- In the final reply, mention whether a follow-up note or brain update was made, or say that none was needed.
