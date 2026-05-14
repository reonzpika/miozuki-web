import type { ReactNode } from 'react';
import RichText from '@/components/rich-text';
import { PdpFaqDisclosureChevron } from '@/components/pdp-faq-disclosure-parts';

function InfoCard({
  icon,
  title,
  body,
  richTextJson,
  panelFooter,
}: {
  icon: ReactNode;
  title: string;
  /** Plain fallback when `richTextJson` is empty (Shopify single-line or legacy). */
  body?: string;
  /** Shopify `rich_text_field` JSON from metafields (`custom.product_material`, etc.). */
  richTextJson?: string | null;
  /** Extra block below rich text / body (e.g. specs table). */
  panelFooter?: ReactNode;
}) {
  const trimmedBody = body?.trim() ?? '';
  const trimmedRich = richTextJson?.trim() ?? '';
  const hasRich = Boolean(trimmedRich);
  const hasFooter = panelFooter != null;
  const hasPlain = Boolean(trimmedBody);
  const expandable = hasRich || hasPlain || hasFooter;

  if (!expandable) {
    return (
      <div className="rounded-sm border border-charcoal/8 bg-cream p-4">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-burgundy" aria-hidden>
            {icon}
          </span>
          <h3 className="text-sm font-medium tracking-wide text-charcoal">{title}</h3>
        </div>
      </div>
    );
  }

  return (
    <details className="group rounded-sm border border-charcoal/8 bg-cream">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 transition-colors hover:bg-charcoal/[0.02] [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream">
        <span className="flex min-w-0 flex-1 items-center gap-3">
          <span className="shrink-0 text-burgundy" aria-hidden>
            {icon}
          </span>
          <h3 className="text-sm font-medium tracking-wide text-charcoal">{title}</h3>
        </span>
        <PdpFaqDisclosureChevron />
      </summary>
      <div className="border-t border-charcoal/8 px-4 pb-4 pt-3">
        <div className="space-y-3">
          {hasRich ? (
            <RichText
              value={trimmedRich}
              className="text-xs leading-relaxed text-charcoal/65"
            />
          ) : null}
          {!hasRich && hasPlain ? (
            <p className="text-xs leading-relaxed text-charcoal/65">{trimmedBody}</p>
          ) : null}
          {panelFooter}
        </div>
      </div>
    </details>
  );
}

export function PdpInfoCardsSection({
  description,
  materialsRichText,
  productDetailsRichText,
  whatsIncludedRichText,
  showMadeToOrderBanner = true,
}: {
  /** Shopify product story: sits under the heading, before the info cards. */
  description?: ReactNode;
  /** Metafield `custom.product_material` (rich text). */
  materialsRichText?: string | null;
  /** Metafield `custom.product_details` (rich text). */
  productDetailsRichText?: string | null;
  /** Metafield `custom.what_is_included` (rich text). */
  whatsIncludedRichText?: string | null;
  /** When false, the made-to-order callout above Craft & materials is omitted (used for earrings). */
  showMadeToOrderBanner?: boolean;
}) {
  return (
    <section className="space-y-6" aria-labelledby="pdp-craft-heading">
      <div>
        {showMadeToOrderBanner ? (
          <div
            className="rounded-sm border border-charcoal/10 border-l-[3px] border-l-burgundy bg-surface px-4 py-3.5 md:px-5 md:py-4"
            role="note"
          >
            <p className="text-sm font-medium leading-relaxed text-charcoal">
              Made To Order: up to 4–6 weeks from production to local NZ delivery.
            </p>
          </div>
        ) : null}
        <h2
          id="pdp-craft-heading"
          className="mt-4 text-xs font-medium uppercase tracking-widest text-charcoal/40"
        >
          Craft &amp; materials
        </h2>
        {description ? (
          <div className="mt-4 border-t border-charcoal/8 pt-6">{description}</div>
        ) : null}
      </div>
      <div className="grid gap-3">
        <InfoCard
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          }
          title="Materials"
          richTextJson={materialsRichText}
          body="S925 sterling silver with careful finishing, shaped for lasting shine and comfortable daily wear."
        />
        <InfoCard
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M8 13h8" />
              <path d="M8 17h8" />
              <path d="M8 9h4" />
            </svg>
          }
          title="Details"
          richTextJson={productDetailsRichText}
          body="Proportions, finish, and wear notes for this piece; use the size guide for ring fit and reach out if you need measurements confirmed before you buy."
        />
        <InfoCard
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16.5 9.4 7.55 4.24" />
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <path d="M3.27 6.96 12 12.01l8.73-5.05" />
              <path d="M12 22.08V12" />
            </svg>
          }
          title="What's included"
          richTextJson={whatsIncludedRichText}
          body="Gift-ready packaging and optional complimentary initials engraving on eligible rings."
        />
      </div>
    </section>
  );
}
