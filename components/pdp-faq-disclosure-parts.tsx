/**
 * Shared markup for PDP FAQ-style <details> rows (shipping, returns, ask a question, etc.).
 * Kept separate so client forms can reuse the same summary/panel pattern without importing the full PDP story module.
 */
export const PDP_FAQ_DISCLOSURE_SUMMARY_CLASSNAME =
  'flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-sm text-charcoal transition-colors hover:text-burgundy [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream';

export const PDP_FAQ_DISCLOSURE_PANEL_CLASSNAME =
  'border-t border-charcoal/8 bg-surface/60 px-4 py-4 md:px-5';

export function PdpFaqDisclosureChevron() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0 text-charcoal/65 transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out)] group-open:rotate-180 motion-reduce:transition-none"
      aria-hidden
    >
      <path
        d="M3 6l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
