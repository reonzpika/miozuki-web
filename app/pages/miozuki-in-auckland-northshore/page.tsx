import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Miozuki in Auckland: Ethical Moissanite & Pearl Bridal Jewellery | Miozuki',
  description:
    'Auckland-based Miozuki brings ethically sourced moissanite and freshwater pearl bridal jewellery to New Zealand brides, with NZ-wide shipping and S925 sterling silver.',
};

const linkClass =
  'text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors';

export default function AucklandNorthShorePage() {
  return (
    <main className="max-w-2xl mx-auto px-6 md:px-10 py-16">
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/65 mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <span>Miozuki in Auckland</span>
      </nav>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-4">
        Miozuki in Auckland: Ethical Moissanite &amp; Freshwater Pearl Bridal Jewellery
      </h1>
      <p className="text-sm text-charcoal/65 leading-relaxed mb-10">
        Based in Auckland, Miozuki brings ethically sourced moissanite and freshwater pearl bridal
        pieces to New Zealand brides. Discover a collection designed for accessible luxury, with
        moissanite set in genuine sterling silver (S925) and gold crafted for enduring sparkle on your
        wedding day.
      </p>

      <div className="h-px bg-charcoal/8 mb-10" />

      <div className="space-y-10 text-sm text-charcoal/65 leading-relaxed">

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">About Miozuki in Auckland</h2>
          <p className="mb-4">
            Miozuki is a New Zealand brand based in Auckland, offering a curated selection of bridal
            pieces that balance modern design with ethical materials. Our Auckland-based operations
            ship from New Zealand nationwide, making it easy for couples across the country to access
            the same quality and style that Auckland brides adore.
          </p>
          <p className="mb-4">
            The bridal jewellery collection features moissanite earrings and freshwater pearl styles
            that pair beautifully with traditional wedding looks or contemporary outfits. Each
            moissanite piece is set in genuine sterling silver stamped S925, a key detail that signals
            quality and longevity to discerning shoppers in Auckland and beyond.
          </p>
          <p>
            If you&apos;re exploring options for your wedding day, you&apos;ll find that Miozuki&apos;s
            approach centres on responsible luxury: sparkle with a clear conscience, and enjoy
            transparent, NZ-based production and shipping.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Our Auckland Bridal Collection</h2>
          <p className="mb-4">
            The{' '}
            <Link href="/collections/bridal-jewellery" className={linkClass}>Bridal Jewellery</Link>{' '}
            collection curated for NZ brides includes a range of elegant moissanite earrings and
            freshwater pearl pieces suitable for wedding ceremonies, engagements, or timeless
            anniversary sets. Whether you envision delicate studs, subtle drops, or classic pearl
            accents, Miozuki offers designs that feel both timeless and trend-forward in the Auckland
            market.
          </p>
          <p className="mb-3 text-charcoal/70">Key materials and details:</p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Moissanite pieces designed for bridal sparkle with a diamond-like brilliance.</li>
            <li>Freshwater pearl accents that suit a range of wedding dress styles.</li>
            <li>Moissanite set in genuine sterling silver stamped S925 for durability and authenticity.</li>
            <li>Access to bespoke options and custom design through our Auckland-based services.</li>
          </ul>
          <p>
            To explore the full range, browse the{' '}
            <Link href="/collections/bridal-jewellery" className={linkClass}>Bridal Jewellery</Link>{' '}
            collection or view{' '}
            <Link href="/collections/moissanite-rings" className={linkClass}>Moissanite Rings</Link>,{' '}
            <Link href="/collections/moissanite-earrings" className={linkClass}>Moissanite Earrings</Link>, and{' '}
            <Link href="/collections/pearl-earrings" className={linkClass}>Pearl Earrings</Link>{' '}
            in our NZ catalogue.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Services Offered in Auckland</h2>
          <div className="mb-5">
            <h3 className="text-charcoal font-medium mb-2">Local shipping from Auckland</h3>
            <p>
              Miozuki operates from Auckland, with NZ-wide shipping available. For Auckland and all
              across New Zealand, you&apos;ll enjoy flat NZ shipping at $8. This makes it
              straightforward to receive your selected bridal pieces without surprise costs.
            </p>
          </div>
          <div className="mb-5">
            <h3 className="text-charcoal font-medium mb-2">Size &amp; fit</h3>
            <p>
              Start with our{' '}
              <Link href="/products/order-your-ring-sizer-credited-toward-your-custom-bespoke-ring" className={linkClass}>ring sizer</Link>{' '}
              for accurate sizing. The service includes a ring sizer option that can be credited toward
              your bespoke or custom-order ring. Whether you&apos;re in Auckland or elsewhere in NZ,
              this helps ensure your pieces fit beautifully on the big day.
            </p>
          </div>
          <div className="mb-5">
            <h3 className="text-charcoal font-medium mb-2">Bespoke &amp; custom</h3>
            <p>
              For brides seeking a unique touch, Miozuki offers{' '}
              <Link href="/pages/bespoke-order" className={linkClass}>custom and bespoke order services</Link>.
              From design consultations to final creations, we can help bring your bridal vision to
              life.
            </p>
          </div>
          <div>
            <h3 className="text-charcoal font-medium mb-2">Appointments &amp; in-person support</h3>
            <p>
              If you&apos;d like to discuss your wedding jewellery in person, we offer{' '}
              <Link href="/pages/appointment-online" className={linkClass}>appointment options</Link>{' '}
              to connect with our team and review pieces up close in a relaxed Auckland setting.
              Schedule an online or in-person session through the site.
            </p>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Why Choose Miozuki Locally in Auckland</h2>
          <p className="mb-4">
            Choosing Miozuki in Auckland means aligning with a New Zealand brand anchored in ethical
            materials, transparent sourcing, and local support. Our moissanite is positioned as an
            ethical alternative to mined stones, crafted with a focus on responsible production and a
            clear value proposition: premium sparkle, contemporary design, and a commitment to
            sustainability in the NZ bridal market.
          </p>
          <p>
            For couples planning weddings across New Zealand, this local connection offers reassurance
            about provenance while still enjoying the accessibility of online shopping and flat-rate
            shipping. With S925 sterling silver or gold settings, a focus on durability, and a diverse
            bridal range, Miozuki in Auckland stands as a trusted option for couples seeking ethical
            moissanite and freshwater pearls.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Care Tips for Miozuki Bridal Jewellery in Auckland</h2>
          <p className="mb-4">
            Auckland&apos;s coastal climate and humidity can influence how jewellery wears over time.
            To keep your moissanite and freshwater pearl pieces looking their best on your wedding day
            and beyond:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Clean pieces gently with mild soap and lukewarm water; rinse and pat dry with a soft lint-free cloth.</li>
            <li>Store jewellery in a soft pouch or lined box to prevent scratches and tangling.</li>
            <li>Avoid exposure to chlorine, saltwater, and harsh chemicals; remove jewellery before swimming or spa activities common in coastal Auckland summers.</li>
            <li>Have rings sized with our $1 ring sizer and consider bespoke adjustments through our Auckland-based services for a perfect fit.</li>
          </ul>
          <p>
            For longer-term care, schedule a care check with our team during your Auckland journey to
            ensure the metal settings and stones remain secure, especially after engagement ring or
            wedding ring wear.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Ready to Shine at Your Auckland Wedding?</h2>
          <p className="mb-4">
            Discover ethically crafted moissanite and freshwater pearl bridal pieces designed for
            modern Auckland brides. Shop the collection today or book a bespoke consultation to bring
            your dream bridal look to life.
          </p>
          <Link
            href="/collections/bridal-jewellery"
            className="text-xs tracking-widest uppercase text-burgundy underline underline-offset-4 hover:text-burgundy/70 transition-colors"
          >
            Shop the Bridal Jewellery collection
          </Link>
        </div>
      </div>
    </main>
  );
}
