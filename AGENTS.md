# Miozuki Web

This is the customer-facing Miozuki website. Real customers may see changes shortly after they are made live.

## Which rules to follow

- If the user is Ting or does not explicitly say they are Ryo, follow `.cursor/rules/miozuki-strict.mdc`.
- If the user explicitly says they are Ryo, follow `CLAUDE.md`.
- If instructions conflict, Ting's strict Cursor rules win for Ting sessions.

## Safe sync reminder

- Before website work, run `npm run sync:safe`.
- This may update or merge the local copy, but it never makes the site live.
- After Ting says "make it live", use `npm run sync:publish`.
- Never run `npm run dev` directly while Cursor may already have the preview running. Use `npm run dev:restart` once if the preview is stuck.
