# Cursor follow-ups for Ryo

When Ting asks Cursor for something outside the safe zone (locked files, Shopify-content fixes, anything Cursor refuses per `.cursor/rules/miozuki-strict.mdc`), Cursor logs a one-line entry below so Ryo can pick it up later.

Format: `- YYYY-MM-DD: <one-line description of what Ting asked for>`

Cursor: append at the end, do not edit older entries. Ryo: strike through or delete entries once handled.

---

- 2026-07-08: Ting updated the Custom Made page to highlight gold options. The change is saved locally in commits `53d7619` and `ad48772`, but publishing failed because GitHub credentials were unavailable: `SEC_E_NO_CREDENTIALS`. The in-app browser also could not capture a screenshot of the local preview because the browser policy blocked `http://127.0.0.1:3000/pages/bespoke-order`. Site checks passed after temporary internet access for Google fonts; lint still shows an unrelated existing warning in `app/pages/nz-au-to-us-ring-size-converter/page.tsx` about unused `linkClass`.
