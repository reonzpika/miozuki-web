---
paths:
  - "components/**"
  - "app/**/*.tsx"
---
# Miozuki UI Component Rules

## Tokens
- Use ONLY CSS token variables for colours, spacing, and typography
- No hardcoded hex, rgb, or hsl values anywhere
- No magic pixel values — use Tailwind spacing scale

## Typography
- Headings: `font-serif` (Playfair Display), weight 700–800
- Body and UI: `font-sans` (DM Sans), weight 300 prose / 500 labels
- Never use `font-bold` on DM Sans — use `font-medium` (500) at most

## Colour
- Brand moments: `text-accent`, `border-accent`, `bg-burgundy`
- Secondary text: `text-muted`
- Cards / panels: `bg-surface`
- Borders: `border-border`

## Interactive states
Every interactive element must have:
- `hover:` state
- `focus-visible:` state with visible ring (not just outline: none)
- `disabled:` state with reduced opacity

## Animation
- Use motion token variables: `--duration-fast`, `--duration-normal`, `--duration-slow`
- Restrict to `transform` and `opacity` (compositor-only properties)
- Never add animation without checking `prefers-reduced-motion` — the global safety net in globals.css handles this, but do not fight it with `!important`

## Component hygiene
- Check `components/` for an existing component before creating a new one
- No inline `style={{}}` props — use Tailwind classes with tokens
- No `className` string concatenation — use `cn()` if the utility is available, otherwise template literals only
