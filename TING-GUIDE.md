l # Miozuki-Web: Ting's Guide

## Starting work

1. Open the **miozuki-web** folder in Cursor
2. The dev server starts automatically in the background
3. Open your browser and go to **[http://localhost:3000.](http://localhost:3000)** 
  1. you can also open it on your default browswer

That's it. The site is now running locally.

---

## Making changes

1. In Cursor, describe what you want to change to the AI (open the Agent panel, or press `Ctrl+I`)
2. The AI will edit the files
3. Check **[http://localhost:3000](http://localhost:3000)** — the page will reload automatically
4. Keep going until it looks right

---

## Saving and publishing your changes

The **quick publish** shortcut is already set up on this machine. You do not need to configure anything.

**To publish:** Press `Ctrl+Alt+P` at any time. Cursor runs **Publish Changes**: it commits and pushes everything for you. The commit message is timestamped so you can see when updates went up.

A terminal panel will briefly show the git output. If it stays open with an error, nothing was published — message Ryo.

Prefer the Source Control panel instead? Use the steps in **Saving and publishing your changes** above..

---

## AI-generated images

To make hero art, banners, or other graphics for the site: open the **Agent** chat and describe what you want (mood, colours, aspect ratio if you know it, and where it will be used). The assistant follows `**docs/context/miozuki-nano-banana-image-guide.md`** and the **LaoZhang / Nano Banana** workflow (see `**scripts/prompts/_templates.md`** for brand rules: no AI jewellery in frame).

---

## If something looks broken

- Don't panic. The live site can be rolled back instantly.
- Message Ryo with a screenshot of what's wrong.
- If the dev server stops (terminal panel goes quiet), press `Ctrl+Shift+P` and search for "Run Task" → "Start Dev Server".

---

## Bookmarks to save


| URL                                            | What it is         |
| ---------------------------------------------- | ------------------ |
| [http://localhost:3000](http://localhost:3000) | Your local preview |
| [https://miozuki.co.nz](https://miozuki.co.nz) | Live site          |


