# Miozuki-Web: Ting Collaboration Workflow

**Date:** 2026-04-15
**Status:** Approved
**Scope:** Git workflow and Cursor setup for two-person team (Ryo + Ting)

---

## Context

Ting (Shih-Ting Chou) is the primary day-to-day contributor to miozuki-web, focusing on content/copy and UI changes. She uses Cursor with AI assistance and is non-technical. Ryo handles structural/feature work.

Goal: Ting should be able to open Cursor, talk to AI, preview locally, and push changes without touching a terminal or knowing any Git concepts.

---

## Workflow Design

### Ting's workflow (master branch)

Ting works directly on `master`. Her session flow:

1. Open the project in Cursor
2. Dev server starts automatically (VS Code task on folder open)
3. Browser opens at `localhost:3000`
4. Chat with Cursor AI to make content/UI changes
5. Review changes at `localhost:3000`
6. Source Control panel: type a short commit message, click Commit
7. Changes auto-push to master (no separate Push step)
8. Vercel deploys to production in ~60 seconds

No terminal commands. No branch management. No staging step.

### Ryo's workflow (feature branches)

Ryo works on short-lived branches for any structural, feature, or risky changes:

1. Create branch from master (Cursor bottom-left branch switcher)
2. Build and test locally
3. Push branch to GitHub
4. Open a PR — Vercel auto-generates a preview URL
5. Share the preview URL with Ting for approval
6. Merge to master once approved

No enforcement rules on GitHub. Convention-based only — Ting has no reason to create branches.

---

## Setup Deliverables

### 1. `.vscode/tasks.json`

Auto-starts `npm run dev` when the project folder opens in Cursor. Also opens `localhost:3000` in the browser automatically. Ting approves the "Allow automatic tasks?" prompt once on first open.

### 2. `.vscode/settings.json`

Key settings:
- `git.postCommitCommand: "sync"` — auto-pushes after every commit
- `git.confirmSync: false` — no confirmation dialog
- `git.enableSmartCommit: true` — no manual file staging needed
- `git.smartCommitChanges: "all"` — stages all changes on commit

Together: Ting types a message, clicks Commit, changes are live on GitHub.

### 3. `TING-GUIDE.md`

Plain-English, single-page cheat sheet covering:
- How to open the project and start working
- How to check changes at `localhost:3000`
- How to commit and push (Source Control panel steps)
- What to do if something looks broken (message Ryo — Vercel rolls back instantly)

### 4. `CLAUDE.md` update

Add a note on the two-track workflow so AI agents in Ting's Cursor sessions understand she works on master and should not suggest branching or terminal commands.

---

## Risk and Mitigations

| Risk | Mitigation |
|------|-----------|
| Ting's change breaks production | Vercel one-click rollback; content/UI changes are low-risk |
| Merge conflict (Ryo + Ting push simultaneously) | Cursor shows the conflict inline; Ryo resolves it |
| Auto-task not triggering | Fallback: `npm run dev` in Cursor's integrated terminal (documented in TING-GUIDE) |

---

## Out of Scope

- GitHub branch protection rules
- Staging environment
- CI/CD beyond existing Vercel integration
- Any changes to Vercel project configuration
