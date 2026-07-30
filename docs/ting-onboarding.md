# Ting: quick start

You are already set up on this machine. This is your day-to-day workflow.

---

## How you work

1. **Open the project** in Cursor (`miozuki-web` folder). The dev server should start automatically; the first time, click **Allow** if Cursor asks about tasks.
2. **Edit** the files you need (with the AI or by hand).
3. **Check in the in-app browser** at [http://127.0.0.1:3000](http://127.0.0.1:3000). The page usually updates while we work.
4. **Publish** when you are happy with how it looks (see below).

You do **not** need to create branches, switch branches, or use Git in the terminal. Stay on **master** and keep working as normal.

If the preview says **connection refused**, close and reopen the `miozuki-web` folder first. The Agent can run **`npm run dev:restart`** once if it still fails. If that does not fix it, ask the Agent to explain the safest next step.

---

## Publishing your changes

The Agent saves for you after you are happy with the local preview. A save is private on this laptop, so customers do not see it yet.

When you are happy, tell the Agent you are happy or say **make it live**. It will check the site, bring in any background updates if needed, save, and publish for you.

No shortcut to press. No Source Control panel to open.

If lint or build fails, the Agent will say so in plain English and try to fix it. If it cannot, it will explain the safest next step and ask you before trying anything risky.

---

## AI-generated images

To make hero art, banners, or other graphics for the site: open the **Agent** chat and describe what you want (mood, colours, aspect ratio if you know it, and where it will be used). The assistant follows `**docs/context/miozuki-nano-banana-image-guide.md`** and the **LaoZhang / Nano Banana** workflow (see `**scripts/prompts/_templates.md`** for brand rules: no AI jewellery in frame).

---

## More detail

For troubleshooting, the one-time keyboard shortcut setup, and useful bookmarks, read **[TING-GUIDE.md](../TING-GUIDE.md)** in the project root.
