# Ting Laptop Setup

One-time setup guide. Follow in order. Estimated time: 15 minutes.

---

## Before you start

You need to bring:

- Your `.env.local` file (copy to Ting's machine via USB)

---

## Step 1: Check prerequisites

Open a terminal on Ting's machine and confirm these are installed:

```bash
node --version    # needs to be v18 or above
npm --version     # comes with Node
git --version     # needs to exist
```

If Node is missing: download from [https://nodejs.org](https://nodejs.org) (LTS version).

---

## Step 2: Pull latest repo

If the repo is already cloned:

```bash
cd <path to miozuki-web>
git pull origin master
```

If not yet cloned:

```bash
git clone https://github.com/reonzpika/miozuki-web.git
cd miozuki-web
```

---

## Step 3: Set Git author (once per machine)

**Publish Changes** runs `git commit`. If Git does not know your name and email, the commit fails and `git push` can still run afterwards, which looks like "everything up to date" even when you have edits.

In PowerShell (use your real details; match GitHub if you want clean attribution):

```powershell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

To use identity for this repo only, omit `--global` and run the commands inside `miozuki-web`.

---

## Step 4: Copy .env.local

Paste your `.env.local` file into the root of the miozuki-web folder.

Verify it exists:

```bash
ls .env.local
```

---

## Step 5: Install dependencies

```bash
npm install
```

---

## Step 6: Open project in Cursor

Open the miozuki-web folder in Cursor.

Cursor will show a notification at the bottom:

> "This workspace has tasks configured to run automatically when the folder is opened. Do you want to allow automatic tasks to run?"

Click **Allow**.

The terminal panel will open and `npm run dev` will start. Wait for "Ready in Xs" to appear.

---

## Step 7: Verify the site loads

Open a browser and go to **[http://localhost:3000](http://localhost:3000)**

Confirm the Miozuki storefront loads correctly.

---

## Step 8: Set up the Ctrl+Alt+P publish shortcut

In Cursor, press `Ctrl+Shift+P` and search for:

> **Open Keyboard Shortcuts (JSON)**

A file opens. Add this inside the `[...]` brackets (before the closing `]`):

```json
{
  "key": "ctrl+alt+p",
  "command": "workbench.action.tasks.runTask",
  "args": ["Publish Changes"]
}
```

If the file already has entries, add a comma after the last `}` before pasting.

Save with `Ctrl+S`.

---

## Step 9: Test end-to-end

1. Open any file in the project (e.g. `TING-GUIDE.md`)
2. Add a space anywhere and save
3. Press `Ctrl+Alt+P`
4. A terminal panel opens briefly showing git output — wait for it to finish
5. Check [https://github.com/reonzpika/miozuki-web/commits/master](https://github.com/reonzpika/miozuki-web/commits/master) — confirm a new commit appears with a timestamp in the message

If the commit appears: setup is complete. 

Revert the test change:

```bash
git revert HEAD --no-edit
git push
```

---

## Step 10: Walk Ting through TING-GUIDE.md

Open `TING-GUIDE.md` in Cursor and walk through it with her once. Key points:

- Dev server starts automatically when she opens Cursor — she just needs to click Allow once (already done)
- Check changes at `localhost:3000`
- `Ctrl+Alt+P` to publish, or use the Source Control panel for a custom commit message
- If anything looks broken on the live site, message Ryo

---

## Done

Ting is ready to work independently.