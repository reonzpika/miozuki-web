import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { ShopifyImage } from '@/lib/shopify';
import RichText from '@/components/rich-text';
import {
  PDP_FAQ_DISCLOSURE_PANEL_CLASSNAME,
  PDP_FAQ_DISCLOSURE_SUMMARY_CLASSNAME,
  PdpFaqDisclosureChevron,
} from '@/components/pdp-faq-disclosure-parts';

/** PDP: treat as earrings when Shopify type/tags mention earring (covers pearl + moissanite ear lines). */
export function isEarringProduct(
  productType: string | null | undefined,
  tags: readonly string[],
): boolean {
  const type = (productType ?? '').toLowerCase();
  if (type.includes('earring')) return true;
  return tags.some((tag) => tag.toLowerCase().includes('earring'));
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="m9 5 7 7-7 7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Secondary CTAs after add to cart: FAQ quick link and jump back to gallery. */
export function PdpSecondaryActions() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Link
        href="#pdp-help-links"
        className="flex min-h-11 items-center justify-center gap-2 border border-charcoal/10 bg-cream px-3 py-3 text-center text-xs font-medium text-charcoal transition-colors hover:border-charcoal/25 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        <span className="text-burgundy" aria-hidden>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        Questions before ordering
      </Link>
      <Link
        href="#product-gallery"
        className="flex min-h-11 items-center justify-center gap-2 border border-charcoal/10 bg-cream px-3 py-3 text-center text-xs font-medium text-charcoal transition-colors hover:border-charcoal/25 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        <span className="text-burgundy" aria-hidden>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
          </svg>
        </span>
        View on hand
      </Link>
    </div>
  );
}

/** Bullet summary shown inside the expandable Shipping & delivery row on the PDP. */
function PdpShippingGlanceBody() {
  return (
    <>
      <ul className="list-none space-y-2.5 text-xs leading-relaxed text-charcoal/70">
        <li className="flex gap-2.5">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-burgundy/45" aria-hidden />
          <span>
            Free NZ shipping over $300, or $8 flat rate via NZ Post tracked courier with signature.
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-burgundy/45" aria-hidden />
          <span>
            In-stock pieces usually arrive <span className="font-medium text-charcoal">2–7 business days</span> after dispatch. Rural delivery may take longer.
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-burgundy/45" aria-hidden />
          <span>
            Made-to-order pieces may take <span className="font-medium text-charcoal">4–6 weeks</span> to receive for both NZ and AU.
          </span>
        </li>
      </ul>
      <Link
        href="/policies/shipping-policy"
        className="mt-4 inline-flex min-h-11 items-center text-xs font-medium text-burgundy underline underline-offset-4 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        Full shipping policy
      </Link>
    </>
  );
}

/** Returns & sizing summary inside expandable row on the PDP. */
function PdpReturnsGlanceBody() {
  return (
    <>
      <ul className="list-none space-y-2.5 text-xs leading-relaxed text-charcoal/70">
        <li className="flex gap-2.5">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-burgundy/45" aria-hidden />
          <span>
            <span className="font-medium text-charcoal">14-day</span> change-of-mind returns for unworn pieces in original packaging with proof of purchase; return postage is yours unless the item is faulty.
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-burgundy/45" aria-hidden />
          <span>
            <span className="font-medium text-charcoal">Cannot return:</span> earrings (hygiene), custom or engraved pieces, and sale items (final sale).
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-burgundy/45" aria-hidden />
          <span>
            <span className="font-medium text-charcoal">Faulty or damaged:</span> contact us within{' '}
            <span className="font-medium text-charcoal">48 hours</span> with photos so we can sort a replacement or refund.
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-burgundy/45" aria-hidden />
          <span>
            Email{' '}
            <a
              href="mailto:info@miozuki.co.nz"
              className="text-burgundy underline underline-offset-4 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              info@miozuki.co.nz
            </a>{' '}
            before posting anything back. Ring sizing:{' '}
            <Link
              href="/pages/size-guide"
              className="text-burgundy underline underline-offset-4 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              size guide
            </Link>
            .
          </span>
        </li>
      </ul>
      <Link
        href="/pages/returns-refunds-policy"
        className="mt-4 inline-flex min-h-11 items-center text-xs font-medium text-burgundy underline underline-offset-4 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        Full returns &amp; refunds policy
      </Link>
    </>
  );
}

/** Materials & care summary inside expandable row on the PDP. */
function PdpMaterialsCareGlanceBody() {
  return (
    <>
      <ul className="list-none space-y-2.5 text-xs leading-relaxed text-charcoal/70">
        <li className="flex gap-2.5">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-burgundy/45" aria-hidden />
          <span>
            <span className="font-medium text-charcoal">Wear:</span> last on, first off (after perfume and makeup); remove before exercise, swimming, showering, or humid heat. Sweat and chlorine dull pearls and tarnish silver.
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-burgundy/45" aria-hidden />
          <span>
            <span className="font-medium text-charcoal">Clean:</span> lukewarm water with a drop of mild soap and a soft cloth; rinse lightly and pat dry.{' '}
            <span className="font-medium text-charcoal">Never</span> use ultrasonic or steam cleaners on pearls.
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-burgundy/45" aria-hidden />
          <span>
            <span className="font-medium text-charcoal">Rhodium-plated silver:</span> polish only with a non-abrasive jewellery cloth; skip dips and abrasive cleaners so plating stays intact.
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-burgundy/45" aria-hidden />
          <span>
            <span className="font-medium text-charcoal">Store:</span> pouches or lined compartments so pieces do not scratch; keep pearls away from airtight plastic and harder jewellery.
          </span>
        </li>
      </ul>
      <Link
        href="/pages/jewellery-care-guide"
        className="mt-4 inline-flex min-h-11 items-center text-xs font-medium text-burgundy underline underline-offset-4 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        Full jewellery care guide
      </Link>
    </>
  );
}

/** Warranty summary inside expandable row on the PDP. */
function PdpWarrantyGlanceBody() {
  return (
    <>
      <ul className="list-none space-y-2.5 text-xs leading-relaxed text-charcoal/70">
        <li className="flex gap-2.5">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-burgundy/45" aria-hidden />
          <span>
            All Miozuki pieces carry a warranty covering defects from our craftsmanship (not lost
            items, everyday wear and tear, or damage from improper care).
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-burgundy/45" aria-hidden />
          <span>
            <span className="font-medium text-charcoal">Sterling silver:</span>{' '}
            <span className="font-medium text-charcoal">6 months</span> from the date of purchase.
          </span>
        </li>
        <li className="flex gap-2.5">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-burgundy/45" aria-hidden />
          <span>
            <span className="font-medium text-charcoal">Claims:</span> reviewed case by case; you may
            need to return the piece for inspection. Email{' '}
            <a
              href="mailto:info@miozuki.co.nz"
              className="text-burgundy underline underline-offset-4 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              info@miozuki.co.nz
            </a>{' '}
            to start.
          </span>
        </li>
      </ul>
      <Link
        href="/pages/warranty-cover"
        className="mt-4 inline-flex min-h-11 items-center text-xs font-medium text-burgundy underline underline-offset-4 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        Full warranty cover
      </Link>
    </>
  );
}

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

/** Shopify CDN headshot: PDP founder teaser only (matches home / collections). */
const PDP_FOUNDER_HEADSHOT_SRC =
  'https://cdn.shopify.com/s/files/1/0797/0819/3023/files/PXL_20241230_060931026_3_480x480.jpg?v=1767920670';

export function PdpFounderTeaser() {
  return (
    <section
      aria-labelledby="pdp-founder-heading"
      className="rounded-sm border border-charcoal/8 bg-surface p-5"
    >
      <p className="text-xs uppercase tracking-widest text-charcoal/40">
        Founder&apos;s story
      </p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-charcoal/10">
          <Image
            src={PDP_FOUNDER_HEADSHOT_SRC}
            alt="Ting Eguchi, founder of Miozuki"
            width={56}
            height={56}
            className="object-cover object-top"
          />
        </div>
        <div className="min-w-0">
          <blockquote
            id="pdp-founder-heading"
            className="text-sm leading-relaxed text-charcoal/80"
          >
            &ldquo;I created Miozuki to honour the charisma of contrast - the woman who is both soft
            and strong, like pearl and moissanite. It began with a fortune slip in Fukuoka, Japan,
            and became a quiet reminder that true beauty is found in meaning.&rdquo;
          </blockquote>
          <p className="mt-3 text-xs text-charcoal/45">
            Read more on{' '}
            <Link
              href="/pages/our-founder"
              className="text-burgundy underline underline-offset-4 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Our founder
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

/** Extra product angles as a visual strip (layout analogue to UGC in the mockup). */
export function PdpCustomerPhotosStrip({
  images,
  title,
}: {
  images: ShopifyImage[];
  title: string;
}) {
  const strip = images.slice(1, 4);
  if (strip.length === 0) return null;

  return (
    <section aria-labelledby="pdp-photos-heading" className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-charcoal/40">
          On the product
        </p>
        <h2
          id="pdp-photos-heading"
          className="mt-2 font-serif text-2xl leading-tight text-charcoal"
        >
          More angles
        </h2>
        <p className="mt-2 text-sm text-charcoal/65">
          Swipe the gallery above or compare these stills before you read
          reviews.
        </p>
      </div>
      <ul className="grid grid-cols-3 gap-2">
        {strip.map((img, i) => (
          <li key={img.url} className="relative aspect-[3/4] overflow-hidden bg-cream/60">
            <Image
              src={img.url}
              alt={img.altText ?? `${title} — photo ${i + 2}`}
              fill
              sizes="(max-width: 768px) 33vw, 180px"
              className="object-cover"
            />
          </li>
        ))}
      </ul>
      <Link
        href="#reviews"
        className="inline-flex items-center gap-1 text-xs font-medium text-burgundy underline underline-offset-4 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        Jump to reviews
        <ChevronRightIcon className="text-burgundy" />
      </Link>
    </section>
  );
}

export function PdpQuickLinksRow() {
  return (
    <section
      id="pdp-help-links"
      aria-labelledby="pdp-faq-heading"
      className="scroll-mt-28 border-t border-charcoal/8"
    >
      <h2
        id="pdp-faq-heading"
        className="pt-2 pb-4 font-serif text-2xl leading-tight text-charcoal"
      >
        FAQ
      </h2>
      <nav aria-label="FAQ topics">
        <ul className="[&>li:last-child]:border-b-0">
          <li className="border-b border-charcoal/8">
            <details className="group">
              <summary className={PDP_FAQ_DISCLOSURE_SUMMARY_CLASSNAME}>
                <span>Shipping & delivery</span>
                <PdpFaqDisclosureChevron />
              </summary>
              <div className={PDP_FAQ_DISCLOSURE_PANEL_CLASSNAME}>
                <PdpShippingGlanceBody />
              </div>
            </details>
          </li>
          <li className="border-b border-charcoal/8">
            <details className="group">
              <summary className={PDP_FAQ_DISCLOSURE_SUMMARY_CLASSNAME}>
                <span>Returns & size support</span>
                <PdpFaqDisclosureChevron />
              </summary>
              <div className={PDP_FAQ_DISCLOSURE_PANEL_CLASSNAME}>
                <PdpReturnsGlanceBody />
              </div>
            </details>
          </li>
          <li className="border-b border-charcoal/8">
            <details className="group">
              <summary className={PDP_FAQ_DISCLOSURE_SUMMARY_CLASSNAME}>
                <span>Materials & care</span>
                <PdpFaqDisclosureChevron />
              </summary>
              <div className={PDP_FAQ_DISCLOSURE_PANEL_CLASSNAME}>
                <PdpMaterialsCareGlanceBody />
              </div>
            </details>
          </li>
          <li className="border-b border-charcoal/8">
            <details className="group">
              <summary className={PDP_FAQ_DISCLOSURE_SUMMARY_CLASSNAME}>
                <span>Warranty</span>
                <PdpFaqDisclosureChevron />
              </summary>
              <div className={PDP_FAQ_DISCLOSURE_PANEL_CLASSNAME}>
                <PdpWarrantyGlanceBody />
              </div>
            </details>
          </li>
        </ul>
      </nav>
    </section>
  );
}

export function PdpCustomEnquiry() {
  return (
    <section
      aria-labelledby="pdp-custom-heading"
      className="rounded-sm border border-charcoal/8 bg-cream p-5"
    >
      <p className="text-xs uppercase tracking-widest text-charcoal/40">
        Custom enquiries
      </p>
      <h2
        id="pdp-custom-heading"
        className="mt-2 font-serif text-xl leading-tight text-charcoal"
      >
        Looking for a custom version?
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
        Tell us what you have in mind, and we&apos;ll come back with custom options.
      </p>
      <Link
        href="/pages/custom-made"
        className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-burgundy underline underline-offset-4 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        Enquire about a custom piece
        <ChevronRightIcon className="text-burgundy" />
      </Link>
    </section>
  );
}
