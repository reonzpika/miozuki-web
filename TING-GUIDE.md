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
2. You'll see a list of changed files — these are everything that will go live
3. In the **Message** box at the top, type a short description of what you changed
   - Example: `update homepage hero text`
   - Example: `change ring size guide wording`
4. Click the **Commit** button (tick/checkmark icon)
5. Cursor automatically pushes your changes to GitHub
6. Vercel picks them up and the live site updates within about 60 seconds

**Note:** All files shown in the Source Control panel will be published when you click Commit. If you see any files you didn't mean to change, message Ryo before committing.

---

## If something looks broken

- Don't panic. The live site can be rolled back instantly.
- Message Ryo with a screenshot of what's wrong.
- If the dev server stops (terminal panel goes quiet), press `Ctrl+Shift+P` and search for "Run Task" → "Start Dev Server".

---

## Bookmarks to save

| URL | What it is |
|-----|-----------|
| http://localhost:3000 | Your local preview |
| https://miozuki.co.nz | Live site |
