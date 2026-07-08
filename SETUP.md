# New machine setup (run once)

Give this file to the Cursor Agent on a freshly cloned `miozuki-web` to get the
site running locally. This is a one-time setup, done by Ryo. If the Agent treats
you as Ting by default, tell it **"I am Ryo"** first so it has full access.

The goal: install dependencies and pull the environment secrets from Vercel so
the local site can talk to Shopify, the admin, and checkout.

## What the Agent should run

1. **Install dependencies**

   ```
   npm install
   ```

2. **Install the Vercel CLI** (if `vercel --version` fails)

   ```
   npm install -g vercel
   ```

3. **Log in to Vercel** as an account that is on the Miozuki team
   (`nexwave-solutions-projects`)

   ```
   vercel login
   ```

4. **Link this folder to the Vercel project.** When asked, choose the
   `nexwave-solutions-projects` scope and the `miozuki-web` project.

   ```
   vercel link
   ```

5. **Pull the environment secrets.** Use the **production** environment: it is
   the complete set (46 vars, including the admin login). The default
   `development` set is incomplete, do not use it.

   ```
   vercel env pull .env.local --environment=production
   ```

6. **Start the site.** Opening the `miozuki-web` folder in Cursor silently checks
   for safe website updates, then starts the dev server automatically. If it is
   not running:

   ```
   npm run dev:restart
   ```

   Do not run `npm run dev` directly while Cursor auto-start is active; use
   `dev:restart` so only one server owns port 3000.

## Check it worked

- Open `http://127.0.0.1:3000` — the home page loads with real products.
- Open `http://127.0.0.1:3000/admin` and log in with the admin password
  (it came down in step 5). The **Rules** tab is Ting's guide to the site.

## Important

- `.env.local` holds live secrets and is git-ignored. Never commit it.
- Re-run step 5 any time the secrets change in Vercel.
