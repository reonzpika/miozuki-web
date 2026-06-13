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

## Where each thing is edited (important)

We are building a new version of the site (this is the one you open in Cursor). It is not live on miozuki.co.nz yet, so for now your changes show on the preview address, not the main site. Each kind of content has ONE home:

- **Products, collections, blog/news posts** → edit in **Shopify admin**. The new site pulls these in automatically.
- **Pages** (About, Our Founder, Shipping, Returns, size guide, FAQ, contact, etc.) → these live in the **code**. Change them by asking the AI in Cursor, the same way you make any other change. For the new site, do NOT edit these pages in Shopify, the page versions in Shopify belong to the old site and are being replaced.

Quick test: if it is a product, a collection, or a blog post, use Shopify. If it is a page of writing (about us, policies, guides), ask the AI in Cursor.

---

## Saving and publishing your changes

Cursor publishes for you automatically. After a meaningful change, the Agent runs lint and build checks, then commits and pushes to `master` on its own. You will see a short note from the Agent saying it published.

You do not need to press any shortcut. You do not need to use the Source Control panel.

If the Agent says lint or build failed, it will not publish. It will show you the error in plain English and try to fix it. If it cannot, message Ryo.

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


