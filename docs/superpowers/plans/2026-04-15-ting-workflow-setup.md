# Ting Workflow Setup Implementation Plan

> Superseded as day-to-day guidance by the Ting-first Codex workflow adopted on 2026-07-30. Keep this file as historical setup context only.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure miozuki-web so Ting can open Cursor, make AI-assisted changes, and push to master without using a terminal or knowing any Git concepts.

**Architecture:** Four config/doc files: a VS Code task that auto-starts the dev server on folder open, VS Code Git settings that auto-push after commit, a plain-English guide for Ting, and a CLAUDE.md update that tells AI agents about the two-track workflow.

**Tech Stack:** VS Code/Cursor tasks API, VS Code Git settings, Next.js (`npm run dev`), Markdown

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `.vscode/tasks.json` | Auto-starts `npm run dev` when project opens |
| Create | `.vscode/settings.json` | Auto-syncs to GitHub after every commit |
| Create | `TING-GUIDE.md` | Plain-English workflow guide for Ting |
| Modify | `CLAUDE.md` | Add two-track workflow note for AI agents |

---

## Task 1: Create `.vscode/tasks.json`

**Files:**
- Create: `.vscode/tasks.json`

- [ ] **Step 1: Create the file**

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Dev Server",
      "type": "shell",
      "command": "npm run dev",
      "isBackground": true,
      "runOptions": {
        "runOn": "folderOpen"
      },
      "presentation": {
        "reveal": "always",
        "panel": "dedicated",
        "clear": true
      },
      "problemMatcher": {
        "pattern": {
          "regexp": "^$"
        },
        "background": {
          "activeOnStart": true,
          "beginsPattern": "> next dev",
          "endsPattern": "Ready in"
        }
      }
    }
  ]
}
```

The `isBackground: true` + `problemMatcher` combination tells Cursor the task runs persistently. `beginsPattern`/`endsPattern` match Next.js's startup output so Cursor knows when the server is ready. `runOn: "folderOpen"` triggers it automatically when the project folder opens.

- [ ] **Step 2: Verify manually**

Open the miozuki-web folder in a fresh Cursor window. Cursor should show a notification:

> "This workspace has tasks configured to run automatically when the folder is opened. Do you want to allow automatic tasks to run?"

Click **Allow**. The Terminal panel should open and `npm run dev` should start. Navigate to `http://localhost:3000` and confirm the site loads.

If the notification doesn't appear: press `Ctrl+Shift+P` → "Manage Automatic Tasks in Folder" → Enable.

- [ ] **Step 3: Commit**

```bash
git add .vscode/tasks.json
git commit -m "tooling: auto-start dev server on folder open"
```

---

## Task 2: Create `.vscode/settings.json`

**Files:**
- Create: `.vscode/settings.json`

- [ ] **Step 1: Create the file**

```json
{
  "git.postCommitCommand": "sync",
  "git.confirmSync": false,
  "git.enableSmartCommit": true,
  "git.smartCommitChanges": "all"
}
```

Settings explained:
- `git.postCommitCommand: "sync"` — after clicking Commit, Cursor automatically runs Pull+Push (sync) with no extra step
- `git.confirmSync: false` — suppresses the "1 commit ahead, push?" confirmation dialog
- `git.enableSmartCommit: true` — allows committing without manually staging files first
- `git.smartCommitChanges: "all"` — stages all changed files automatically on commit

- [ ] **Step 2: Verify manually**

Make a trivial change to any file (e.g. add a space to `TING-GUIDE.md` once it exists). Go to the Source Control panel (branch icon in the left sidebar). Type any commit message. Click the **Commit** button (checkmark). Confirm:
- No "Push" or "Sync Changes" prompt appears
- After a few seconds, running `git log --oneline -2` in the terminal shows the commit is on the remote

Revert the trivial change.

- [ ] **Step 3: Commit**

```bash
git add .vscode/settings.json
git commit -m "tooling: auto-sync git after commit for Ting"
```

---

## Task 3: Create `TING-GUIDE.md`

**Files:**
- Create: `TING-GUIDE.md` (project root)

- [ ] **Step 1: Create the file**

```markdown
# Miozuki-Web: Ting's Guide

## Starting work

1. Open the **miozuki-web** folder in Cursor
2. A panel at the bottom will open and start the dev server automatically
   - First time only: click **Allow** when Cursor asks about automatic tasks
3. Open your browser and go to **http://localhost:3000**

That's it. The site is now running locally.

---

## Making changes

1. In Cursor, describe what you want to change to the AI (Agent panel or Cmd+I)
2. The AI will edit the files
3. Check **http://localhost:3000** — the page will reload automatically
4. Keep going until it looks right

---

## Saving and publishing your changes

1. Click the **Source Control icon** in the left sidebar (it looks like a branch/fork)
2. You'll see a list of changed files
3. In the **Message** box at the top, type a short description of what you changed
   - Example: `update homepage hero text`
   - Example: `change ring size guide wording`
4. Click the **Commit** button (tick/checkmark icon)
5. Cursor automatically pushes your changes to GitHub
6. Vercel picks them up and the live site updates within about 60 seconds

---

## If something looks broken

- Don't panic. The live site can be rolled back instantly.
- Ask the Agent to put the site back safely and explain the next step.
- If the dev server stops (terminal panel goes quiet), press `Ctrl+Shift+P` and search for "Run Task" → "Start Dev Server".

---

## Bookmarks to save

| URL | What it is |
|-----|-----------|
| http://localhost:3000 | Your local preview |
| https://miozuki.co.nz | Live site |
```

- [ ] **Step 2: Read through it as if you are Ting**

Check: are there any steps that assume technical knowledge? Are the instructions numbered and clear? Confirm there are no broken links or placeholder text.

- [ ] **Step 3: Commit**

```bash
git add TING-GUIDE.md
git commit -m "docs: add Ting workflow guide"
```

---

## Task 4: Update `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add a two-track workflow section**

In `CLAUDE.md`, find the `## Commands` section near the top. Add the following block directly above it:

```markdown
## Team workflow

This older setup assumed two contributor workflows:

**Ting (content/UI changes — working directly on `master`):**
- Do not suggest creating branches, PRs, or terminal commands
- Do not suggest running `npm run dev` — the dev server starts automatically via VS Code task
- Keep instructions simple: edit files, check localhost:3000, use Source Control panel to commit

**Historical structural/feature workflow (working on feature branches):**
- Normal branching workflow: branch → build → PR → merge to master
- Vercel generates a preview URL for every branch — share these with Ting for approval before merging

```

- [ ] **Step 2: Verify**

Read the updated `CLAUDE.md` from top to bottom. Confirm the new section doesn't duplicate or contradict anything already there.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add two-track workflow note for AI agents"
```

---

## Task 5: Final check and push

- [ ] **Step 1: Confirm all four files are present**

```bash
ls .vscode/tasks.json .vscode/settings.json TING-GUIDE.md
```

Expected: all three listed with no errors. `CLAUDE.md` already existed and was modified.

- [ ] **Step 2: Confirm commits are on remote**

```bash
git log --oneline -5
git status
```

Expected: clean working tree, all commits visible, no uncommitted changes.

- [ ] **Step 3: Verify Ting's full flow end-to-end**

1. Close and reopen the miozuki-web folder in Cursor
2. Confirm the dev server starts automatically in the Terminal panel
3. Confirm `http://localhost:3000` loads
4. Make a trivial change (e.g. add a trailing space to `TING-GUIDE.md`)
5. Go to Source Control panel, type "test commit", click Commit
6. Confirm it auto-pushes (check GitHub or `git log --oneline -1`)
7. Revert the trivial change and push again

If all three checks pass, the setup is complete.
