import Link from 'next/link';
import {
  PDP_FAQ_DISCLOSURE_PANEL_CLASSNAME,
  PDP_FAQ_DISCLOSURE_SUMMARY_CLASSNAME,
  PdpFaqDisclosureChevron,
} from '@/components/pdp-faq-disclosure-parts';

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
