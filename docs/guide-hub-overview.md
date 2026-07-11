# The guide-hub content system: overview

What this is, how the pieces fit, and where to look for more. Written 2026-07-06 as the single orientation point for a system whose knowledge is otherwise spread across two repos and several files. Rewritten 2026-07-09: the drafting engine changed from Harbor to Claude on 2026-07-07, and a large amount of pipeline infrastructure was built and proven since, none of which had reached this file until now.

## What it is, in one paragraph

Three content hubs, `/moissanite-guide`, `/pearl-guide`, `/bridal-guide`, each a set of long-form buying-guide articles targeting real search terms. Ting's Codex runs the whole pipeline itself: picks the next guide, drafts it with **Claude** (Harbor now provides only an optional, free, site-wide research check beforehand), a separate agent verifies and shapes it, she confirms anything the pipeline flagged as needing her real experience, and publishes it. No developer step in the loop.

## Current status (as at 2026-07-09)

Two guides are built, tested, and **live on `master`**, but not yet properly launched:

- `/moissanite-guide/moissanite-vs-diamond-nz`
- `/bridal-guide/bridal-jewellery-sets-nz`

"Live" here means pushed and reachable at their URL, not discoverable: neither is in `app/sitemap.ts` or linked from site navigation yet. Both are awaiting Ting's reply to a confirmation email (drafted, not sent, see `../miozuki-brain/archive/guide-drafts/ting-experience-pass-email-draft.md`) resolving a handful of `VERIFY` markers, invisible notes in the article text flagging exactly what needs her real photo, opinion, or confirmation before either guide is properly finished. New guides from here on follow the same proven pipeline.

## Where the pieces live

| Piece | Lives in | What it holds |
|---|---|---|
| The build order, what to write next | `miozuki-brain/guides/content-plan.md` | Four waves, which old blog content each guide can reuse |
| The full guide map | `miozuki-brain/guides/content-hubs.md` | Every guide's keyword, URL, and its content-ownership boundary (what it must not repeat) |
| The voice rules | `miozuki-brain/brand-pr/voice-guide.md` | Ting's brand voice, banned words |
| **The full procedure** | `miozuki-brain/guides/harbor-content-workflow.md` | The real, current pick/research/draft/verify/publish sequence, the citation rule, the `VERIFY` marker reference. Despite the filename (kept for the wikilinks pointing at it), Harbor is research-only now |
| **The actual drafting/verify prompts** | `miozuki-brain/guides/opus-drafting-prompt-v2.md` | The versioned, generalised Claude prompts: drafting, verify/shape, citation rules, the free Harbor research call wiring |
| **The full pilot test record** | `miozuki-brain/guides/harbor-vs-claude-pilot-findings.md` | Every test round, why Claude won, the citation-trap catches, the mechanical build test, the generalisation test |
| Ting's edit checklist | `miozuki-brain/guides/content-checklist-and-calendar.md` | What she checks before anything goes live, and the pacing decision (no fixed schedule) |
| Raw drafts, verified drafts, flag reports, confirmation emails | `miozuki-brain/guides/drafts/` | Working scratch space, one file type per pipeline stage, see that folder's own `README.md` |
| Codex's operating rules for this repo | `AGENTS.md` (this repo, root) | Scope, safety rails, the guide-hub pipeline job, publishing via `npm run sync:publish` |
| The actual pages | `app/moissanite-guide/`, `app/pearl-guide/`, `app/bridal-guide/` | The real `.mdx` article files, and the shared layout and components (`components/hub/**`, `mdx-components.tsx`) that render them, including `next/image` and markdown-table support |

## The one thing worth knowing before touching any of it

The content-ownership boundary (`content-hubs.md`) exists because one real Harbor draft, tested 2 July 2026, wrote full sections on three other guides' topics inside a single earrings article. That is not a hypothetical risk this system guards against, it already happened once. The same discipline now applies to Claude's drafts too, and the verify/shape step checks for it on every guide, confirmed working on both guides built so far.

## History

- 2026-06-21: hub hosting decided (Next.js routes and MDX), a first scaffold attempt built (later found stale, superseded)
- 2026-07-02: first real Harbor draft generated, the API connection proven working
- 2026-07-05: the stale pilot record corrected, the content-ownership map built, the MDX scaffold rebuilt (at the time; not actually merged to the real `master` branch until 2026-07-09, see below)
- 2026-07-06: full pipeline autonomy handed to Ting's Codex, this file and the repo's `AGENTS.md` added, Harbor still the drafting engine at this point
- 2026-07-07: real 3-round comparative pilot run, **Claude replaces Harbor as the drafting engine**, Harbor narrowed to its free research call only
- 2026-07-07 to 2026-07-08: the two-step draft/verify pipeline built and tested, the citation rule added (and a recurring generic-statistic trap closed after catching it twice), Harbor's free research call wired in and corrected (site-wide, not per-guide)
- 2026-07-09: the mechanical build tested end to end for the first time (a real `.mdx`, a real `npm run build`, a real preview), two scaffold gaps found and fixed (`remark-gfm`, `next/image`), a generalisation test run on a second, different guide and hub, the `[TING: ...]` visible placeholder replaced with the invisible `VERIFY` marker system, the scaffold finally merged into `master` (a real gap: it had never reached `master` before this), two real guides built and pushed live (undiscoverable), this file rewritten to match

## More detail

- The full, current procedure: `../miozuki-brain/guides/harbor-content-workflow.md`
- The actual prompts: `../miozuki-brain/guides/opus-drafting-prompt-v2.md`
- The full pilot record: `../miozuki-brain/guides/harbor-vs-claude-pilot-findings.md`
- Ryo's own working notes on this repo: `CLAUDE.md` (root of this repo)
- Ting's Cursor rules, including the guide-hub content/code boundary: `.cursor/rules/miozuki-strict.mdc`
- Codex's own rules for this repo: `AGENTS.md` (root of this repo)
