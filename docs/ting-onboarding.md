# Ting: quick start

You are already set up on this machine. This is your day-to-day workflow.

---

## How you work

1. **Open the project** in Cursor (`miozuki-web` folder). The dev server should start automatically; the first time, click **Allow** if Cursor asks about tasks.
2. **Edit** the files you need (with the AI or by hand).
3. **Check in the browser** at [http://localhost:3000](http://localhost:3000). The page usually updates when you save.
4. **Publish** when you are happy with how it looks (see below).

You do **not** need to create branches, switch branches, or use Git in the terminal. Stay on **master** and keep working as normal.

---

## Publishing your changes

**Fast way (if you added the shortcut):** press **Ctrl+Alt+P**. That runs **Publish Changes** (commit + push). Wait until any terminal output finishes.

**Or:** use the **Source Control** panel (branch icon on the left), write a short message, then commit. Your workspace may be set up to push after commit; if not, use **Ctrl+Alt+P** or ask Ryo.

Only commit files you mean to publish. If something unexpected appears in the list, stop and message Ryo.

---

## AI-generated images

To make hero art, banners, or other graphics for the site: open the **Agent** chat and describe what you want (mood, colours, aspect ratio if you know it, and where it will be used). The assistant follows `**docs/context/miozuki-nano-banana-image-guide.md`** and the **LaoZhang / Nano Banana** workflow (see `**scripts/prompts/_templates.md`** for brand rules: no AI jewellery in frame).

---

## More detail

For troubleshooting, the one-time keyboard shortcut setup, and useful bookmarks, read **[TING-GUIDE.md](../TING-GUIDE.md)** in the project root.