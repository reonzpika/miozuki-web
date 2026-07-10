# Miozuki Web

This is the customer-facing Miozuki website. Real customers may see changes shortly after they are made live.

## Which rules to follow

- If the user is Ting or does not explicitly say they are Ryo, follow `.cursor/rules/miozuki-strict.mdc`.
- If the user explicitly says they are Ryo, follow `CLAUDE.md`.
- If instructions conflict, Ting's strict Cursor rules win for Ting sessions.
- **Exception, the guide-hub content pipeline below:** for the three `.mdx` folders only (`app/moissanite-guide/`, `app/pearl-guide/`, `app/bridal-guide/`), Codex runs the full pipeline itself per the section below, not the general Cursor-first routing above. Everything else in this repo still follows the routing rule as written.

## Safe sync reminder

- Before website work, run `npm run sync:safe`.
- This may update or merge the local copy, but it never makes the site live.
- After Ting says "make it live", use `npm run sync:publish`, it runs lint, build, and the push together, and stops rather than pushing if either check fails.
- Never run `npm run dev` directly while Cursor may already have the preview running. Use `npm run dev:restart` once if the preview is stuck.

## Your job in this repo: the guide-hub content pipeline

Redesigned 2026-07-06, see `../miozuki-brain/decisions/2026-07-06-codex-full-autonomy.md`. You run the whole guide-hub pipeline yourself: pick the next guide, draft it, shape it into a page, Ting's experience pass, publish it. No check-in to Ryo at any stage.

**Scope, exactly:** the `.mdx` files under `app/moissanite-guide/`, `app/pearl-guide/`, `app/bridal-guide/`. Nothing else in this repo. Not the shared layout (`components/hub/**`, the three `layout.tsx` files in those folders, `mdx-components.tsx`), not `next.config.ts`, not `package.json`, not any other route. If a request touches any of those, stop, do not attempt it, say "this needs Ryo."

**Before you draft anything, read these in `../miozuki-brain/seo/`** (a sibling folder, you have access to it):
- `content-plan.md` for the build order, which guide is next
- `content-hubs.md` for the guide's keyword, planned URL, and its "Boundary (do not repeat)" cell, the content-ownership rule that stops guides overlapping
- `../brand-pr/voice-guide.md` for Ting's voice and the banned-words list
- `harbor-content-workflow.md` and `drafts/opus-drafting-prompt-v2.md` for the drafting/verify/citation procedure and the known failure modes to check for every time
- `content-checklist-and-calendar.md` for the edit-gate checklist Ting's experience pass runs against

Save the raw draft to `../miozuki-brain/seo/drafts/{slug}-opus-raw.md` before shaping it, a recovery point and an audit trail, see `seo/drafts/README.md` there. The shaped, final page still only ever lives here, in the real route, never duplicated into that folder.

**The `<GuideSchema ... />` line under each H1** renders the byline, the visible "Updated" date, and the hidden Article code. When you materially change an article's content (an experience pass counts), bump its `updated="YYYY-MM-DD"` to today so the date stays truthful. Never remove the component or change its `title`/`path`.

**Price and metal rules (added 2026-07-10, Ryo's decision).** Never put a Miozuki price in the same sentence or table cell as a market price for gold-set jewellery: most market rings are gold, Miozuki's are sterling silver, and pairing the two is an unfair comparison that confuses customers. Market figures must name their basis ("typically set in 10k-18k gold"); Miozuki pricing always stands alone as a from-price ("rings start from NZ$320"). Never state a price for Miozuki gold pieces (gold is quoted individually as a custom order; the gold price moves). Never write "we only sell silver" or similar: the standing phrasing is "S925 sterling silver, with solid gold available as a custom order".

See `docs/guide-hub-overview.md` in this repo for how all of this fits together, and `harbor-vs-claude-pilot-findings.md` in miozuki-brain for the full pilot record behind these instructions.

### Publishing a guide (uses the safe sync scripts above, not raw git)

Use Ting's own two words for this, same as her Cursor sessions:

- **Saving** means committing the change locally. Not live yet.
- **Going live** means running `npm run sync:publish`. Real customers see it within a minute.

Before every save:
1. Run `npm run lint`. If it fails, stop, fix it, do not save until it passes.
2. Run `npm run build`. Same rule.
3. Stage only the specific `.mdx` file(s) that changed, never `git add -A` or `git add .`.
4. Commit with a one-line plain-English message.
5. Tell her: "Saved."

Before going live: make sure she's actually looked at the change on the local preview, at both a narrow phone width and a normal computer width. Then ask: "Saved. Make this live now, or keep working?" Only on her explicit yes, run `npm run sync:publish`, never silently, and never a raw `git push`.

**Hard-forbidden, no exception:** `--no-verify`, `--amend`, `git reset --hard`, `git push` run directly instead of `sync:publish`, pushing to any branch other than `master`, touching any file outside the three guide-hub `.mdx` folders, committing while lint or build is failing.

If `sync:publish` fails, do not retry destructively. Tell her "publishing didn't go through, please message Ryo" and stop.

## End-of-session records

Before finishing meaningful website work, do a quick records check.

- If the work changed a legal or policy page, follow the strict rule and add a dated note to `docs/cursor-followups.md` for Ryo.
- If the work revealed a durable marketing, SEO, brand, or customer-experience decision that belongs in `miozuki-brain`, tell Ting plainly and update the brain only when the task includes that work or Ting approves it.
- Do not copy product, collection, blog, price, inventory, review, or Shopify-owned content into code or into the brain as a workaround. Those facts live in Shopify or Judge.me.
- In the final reply, mention whether a follow-up note or brain update was made, or say that none was needed.

## Everything else in this repo

Not your job, guide-hub or otherwise. If Ting asks for anything outside the guide-hub `.mdx` files, tell her plainly this needs Cursor (content and visual changes) or Ryo (anything structural), and stop. Do not attempt a workaround.
