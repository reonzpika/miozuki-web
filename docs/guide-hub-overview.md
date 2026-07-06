# The guide-hub content system: overview

What this is, how the pieces fit, and where to look for more. Written 2026-07-06 as the single orientation point for a system whose knowledge is otherwise spread across two repos and six files.

## What it is, in one paragraph

Three content hubs, `/moissanite-guide`, `/pearl-guide`, `/bridal-guide`, each a set of long-form buying-guide articles targeting real search terms. Ting's Codex runs the whole pipeline itself: picks the next guide, drafts it with Harbor (an AI SEO content platform), shapes the draft into a page, adds her own real experience, and publishes it. No developer step in the loop.

## Where the pieces live

| Piece | Lives in | What it holds |
|---|---|---|
| The build order, what to write next | `miozuki-brain/seo/content-plan.md` | Four waves, which old blog content each guide can reuse |
| The full guide map | `miozuki-brain/seo/content-hubs.md` | Every guide's keyword, URL, and its content-ownership boundary (what it must not repeat) |
| The voice rules | `miozuki-brain/brand-pr/voice-guide.md` | Ting's brand voice, banned words |
| The Harbor procedure | `miozuki-brain/seo/harbor-content-workflow.md` | The full pick, draft, shape, review, publish steps, and the known Harbor output bugs to check for |
| Ting's edit checklist | `miozuki-brain/seo/content-checklist-and-calendar.md` | What she checks before anything goes live |
| Codex's operating rules for this repo | `AGENTS.md` (this repo, root) | Scope, safety rails, what's off-limits |
| The actual pages | `app/moissanite-guide/`, `app/pearl-guide/`, `app/bridal-guide/` | The real `.mdx` article files, and the shared layout and components that render them |

## The one thing worth knowing before touching any of it

The content-ownership boundary (`content-hubs.md`) exists because one real Harbor draft, tested 2 July 2026, wrote full sections on three other guides' topics inside a single earrings article. That is not a hypothetical risk this system guards against, it already happened once.

## History

- 2026-06-21: hub hosting decided (Next.js routes and MDX), a first scaffold attempt built (later found stale, superseded)
- 2026-07-02: first real Harbor draft generated, the API connection proven working
- 2026-07-05: the stale pilot record corrected, the content-ownership map built, the MDX scaffold rebuilt onto current `master`
- 2026-07-06: full pipeline autonomy handed to Ting's Codex, this file and the repo's `AGENTS.md` added

## More detail

- The full Codex procedure and rules for this repo: `AGENTS.md` (root of this repo)
- Ryo's own working notes on this repo: `CLAUDE.md` (root of this repo)
- Ting's Cursor rules, including the guide-hub content/code boundary: `.cursor/rules/miozuki-strict.mdc`
- The knowledge base this all draws on: `../miozuki-brain/seo/harbor-content-workflow.md`
