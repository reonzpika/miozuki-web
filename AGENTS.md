# AGENTS.md

Instructions for Codex (Ting's AI assistant) when working in this repository. Ryo's Claude Code sessions use `CLAUDE.md` instead; Ting's Cursor sessions use `.cursor/rules/miozuki-strict.mdc`. This file is Codex's own, added 2026-07-06, because Codex discovers its rules per git project root, and this repo had none of its own until now, only a general instruction in Ting's machine-wide `~/.codex/AGENTS.md` to defer to Cursor's rules for anything beyond a quick fix.

## What this repo is

Miozuki's Next.js storefront. Full architecture, design system, and commands are in `CLAUDE.md`, written for Ryo, read it if you need the wider picture. This file only covers what you're actually here to do.

## Your job in this repo: the guide-hub content pipeline

Redesigned 2026-07-06, see `../miozuki-brain/decisions/2026-07-06-codex-full-autonomy.md`. You run the whole guide-hub pipeline yourself: pick the next guide, draft it with Harbor, shape it into a page, Ting's experience pass, publish it. No check-in to Ryo at any stage, no cap on how often Harbor gets called, it's Ting's own paid plan.

**Scope, exactly:** the `.mdx` files under `app/moissanite-guide/`, `app/pearl-guide/`, `app/bridal-guide/`. Nothing else in this repo. Not the shared layout (`components/hub/**`, the three `layout.tsx` files in those folders, `mdx-components.tsx`), not `next.config.ts`, not `package.json`, not any other route. If a request touches any of those, stop, do not attempt it, say "this needs Ryo."

**Before you draft anything, read these in `../miozuki-brain/seo/`** (a sibling folder, you have access to it):
- `content-plan.md` for the build order, which guide is next
- `content-hubs.md` for the guide's keyword, planned URL, and its "Boundary (do not repeat)" cell, the content-ownership rule that stops guides overlapping
- `../brand-pr/voice-guide.md` for Ting's voice and the banned-words list
- `harbor-content-workflow.md` for the full call-Harbor-and-shape-the-page procedure, including the known Harbor output bugs to check for every time
- `content-checklist-and-calendar.md` for the edit-gate checklist Ting's experience pass runs against

Save Harbor's raw output to `../miozuki-brain/seo/drafts/{slug}-harbor-raw.md` before shaping it, a recovery point and an audit trail, see `seo/drafts/README.md` there. The shaped, final page still only ever lives here, in the real route, never duplicated into that folder.

See `docs/guide-hub-overview.md` in this repo for how all of this fits together.

## Publishing (the safety rails, self-contained here so they hold even if nothing else loads)

Use Ting's own two words for this, same as her Cursor sessions:

- **Saving** means committing the change locally. Not live yet.
- **Going live** means pushing it to `master`. Real customers see it within a minute.

Before every save:
1. Run `npm run lint`. If it fails, stop, fix it, do not save until it passes.
2. Run `npm run build`. Same rule.
3. Stage only the specific `.mdx` file(s) that changed, never `git add -A` or `git add .`.
4. Commit with a one-line plain-English message.
5. Tell her: "Saved."

Before going live: make sure she's actually looked at the change on the local preview, at both a narrow phone width and a normal computer width. Then ask: "Saved. Make this live now, or keep working?" Push to `master` only on her explicit yes, never silently.

**Hard-forbidden, no exception:** `--no-verify`, `--amend`, `git reset --hard`, pushing to any branch other than `master`, touching any file outside the three guide-hub `.mdx` folders, committing while lint or build is failing.

If a push fails, do not retry destructively. Tell her "publishing didn't go through, please message Ryo" and stop.

## Everything else in this repo

Not your job. If Ting asks for anything outside the guide-hub `.mdx` files, tell her plainly this needs Cursor (content and visual changes) or Ryo (anything structural), and stop. Do not attempt a workaround.
