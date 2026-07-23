import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Custom Bridal Jewellery NZ (Bespoke Orders) | Miozuki',
  description:
    'Design bespoke bridal jewellery in NZ with Miozuki: custom moissanite and freshwater pearl engagement rings, bridal sets, earrings, and pendants, handcrafted to your story.',
};

const linkClass =
  'text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors';

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Can I design custom bridal jewellery from scratch?',
    a: 'Yes. Our bespoke process starts with your vision and a collaborative design phase to ensure the final piece matches your expectations. We emphasise comfort, wearability, and enduring style.',
  },
  {
    q: 'What styles work best for a bridal look, classic vs modern?',
    a: 'Both can be beautifully realised as bespoke pieces. We tailor pieces to suit your dress, complexion, and personal taste, whether you lean toward timeless simplicity or contemporary sparkle.',
  },
  {
    q: 'Can you match my engagement ring or wedding dress style?',
    a: 'Absolutely. Bespoke design lets us harmonise with existing pieces and your dress’s silhouette, so your bridal jewellery feels cohesive and intentional.',
  },
  {
    q: 'What stones are available for custom pieces?',
    a: 'Our bespoke work centres on moissanite and freshwater pearls. We’re happy to discuss sentimental stones or stones you wish to incorporate, provided they suit the design and durability requirements.',
  },
  {
    q: 'How long does a bespoke piece take?',
    a: 'Roughly 4 to 6 weeks. Timelines vary with design complexity and material choices. We provide a clear schedule after the initial discovery, and we keep you updated as the project progresses.',
  },
  {
    q: 'How is pricing determined?',
    a: 'Pricing depends on design complexity, stone choice, and the level of handcrafting required. You’ll receive a detailed quote after the discovery conversation and design approval.',
  },
  {
    q: 'Do you provide aftercare and adjustments?',
    a: 'Yes. We offer guidance on care for moissanite and pearls, and we can discuss adjustments or future updates to your bespoke jewellery as your tastes evolve.',
  },
];

export default function CustomBridalJewelleryPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <main className="max-w-2xl mx-auto px-6 md:px-10 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/65 mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <span>Custom Bridal Jewellery</span>
      </nav>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-4">
        Custom Bridal Jewellery NZ (Bespoke Orders)
      </h1>
      <p className="text-sm text-charcoal/65 leading-relaxed mb-10">
        Welcome to the definitive guide for designing a truly personal expression of love. At Miozuki
        we specialise in moissanite and pearl fine jewellery in NZ. From engagement rings to bridal
        sets and statement earrings, our focus is on craftsmanship and timeless design that speaks to
        you alone.
      </p>

      <div className="h-px bg-charcoal/8 mb-10" />

      <div className="space-y-10 text-sm text-charcoal/65 leading-relaxed">

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">What is custom bridal jewellery?</h2>
          <p className="mb-4">
            Custom bridal jewellery refers to pieces designed specifically for you, tailored to your
            style, story, and preferences. Instead of selecting a pre-made piece, you partner with a
            jeweller to craft something unique, whether that&apos;s a ring set, a pair of earrings, or
            a delicate pendant that complements your wedding day aesthetic. For brides shopping in New
            Zealand, Miozuki offers bespoke orders that embrace the brand&apos;s signature moissanite
            and freshwater pearl fine jewellery ethos, allowing you to incorporate sentimental stones,
            specific shapes, or one-of-a-kind accents into your wedding jewellery.
          </p>
          <p>
            This category hub, Custom Bridal Jewellery NZ (Bespoke Orders), is intended to be your
            go-to resource for understanding options, setting expectations, and choosing the right path
            for a piece you&apos;ll wear with joy beyond the wedding day.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Why choose bespoke for your wedding jewellery?</h2>
          <p className="mb-4">
            Personalisation matters. Bespoke bridal jewellery lets you control style, fit, and
            meaning, producing a piece that resonates with your identity and vows. For many couples,
            custom pieces offer:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>An exact balance of light, brilliance, and size with moissanite or pearls as the core stones.</li>
            <li>A design that complements the engagement ring and wedding dress, rather than matching a generic set.</li>
            <li>Craftsmanship and attention to comfort, weight, and wearability on the wedding day and beyond.</li>
            <li>Story-driven jewellery that can incorporate heirloom gems, sentimental stones, or future family memories.</li>
          </ul>
          <p>
            Miozuki&apos;s approach to custom bridal jewellery is rooted in fine craftsmanship and a
            collaborative process. Our NZ-based studio works with you to translate inspiration into a
            tangible, wearable piece, whether you are drawn to modern designs or timeless elegance.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Types of custom bridal jewellery</h2>
          <div className="mb-5">
            <h3 className="text-charcoal font-medium mb-2">Rings: bespoke engagement rings and wedding rings</h3>
            <p>
              Custom engagement rings and wedding bands offer the chance to select the exact stone,
              cut, and setting that suits your lifestyle. With Miozuki, you can design a ring that
              highlights moissanite&apos;s diamond-like brilliance or uses pearls for a softer,
              classical glow. A bespoke ring can be matched to your unique ring size and a comfort-fit
              profile, ensuring it sits perfectly on your finger.
            </p>
          </div>
          <div className="mb-5">
            <h3 className="text-charcoal font-medium mb-2">Bridal sets: bespoke matching sets that tell a story</h3>
            <p>
              A custom bridal set creates harmony between your engagement ring, wedding band, and any
              complementary pieces. You can choose harmonising shapes, gem accents, and metal tones
              that echo your wedding theme, dress silhouette, and personal taste, while keeping a
              cohesive flow across the pieces.
            </p>
          </div>
          <div className="mb-5">
            <h3 className="text-charcoal font-medium mb-2">Earrings: from delicate studs to statement drops</h3>
            <p>
              Custom bridal earrings in moissanite or pearls can be designed for comfort, weight, and a
              flattering profile. Whether you want timeless studs or a more dramatic earring silhouette
              for the reception, bespoke designs let you tailor length, setting style, and sparkle.
            </p>
          </div>
          <div>
            <h3 className="text-charcoal font-medium mb-2">Necklaces &amp; pendants: personal pieces for the wedding day</h3>
            <p>
              A bespoke necklace or pendant can complement your neckline and veil while incorporating
              your chosen stones. From simple pearl pendants to a multi-stone moissanite necklace, a
              custom piece can be tailored to your dress and ceremony vibe.
            </p>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Materials and stones we specialise in</h2>
          <p className="mb-4">
            Miozuki&apos;s bespoke offerings centre on moissanite and freshwater pearls, crafted into
            bridal jewellery that reflects modern NZ sensibilities and timeless elegance. When
            designing a custom piece, you can choose moissanite for a diamond-like brilliance with
            excellent durability, paired with pearls for a classic, luminous look. Your bespoke piece
            can be designed to suit your skin tone, wedding palette, and personal preferences.
          </p>
          <p>
            In our bespoke process, you&apos;re invited to discuss stone preferences, shapes (round,
            cushion, or other cuts), and size considerations to ensure every facet aligns with your
            vision. While moissanite and pearls are the core elements, your piece can be refined to
            tell your story, today and for years to come.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">How to choose your bespoke design</h2>
          <p className="mb-4">
            Selecting a custom design is a collaborative, joyful journey. Use the steps below to arrive
            at a piece that feels uniquely you.
          </p>
          <ol className="list-decimal pl-5 space-y-2 mb-4">
            <li><strong className="text-charcoal font-medium">Gather inspiration:</strong> look for styles you love in wedding editorials, social media, or heirloom pieces. Collect images that capture the mood, silhouette, and level of sparkle you desire.</li>
            <li><strong className="text-charcoal font-medium">Define your focal stone and material feel:</strong> decide whether moissanite&apos;s brilliance or pearls&apos; lustre best expresses your style, or choose a combination that harmonises across multiple pieces.</li>
            <li><strong className="text-charcoal font-medium">Consider wearability and setting:</strong> think about daily wear versus wedding-day only pieces. We can tailor weight, comfort-fit rings, and secure settings.</li>
            <li><strong className="text-charcoal font-medium">Set a budget and timeline:</strong> bespoke projects have flexible scopes. Early discussions help align expectations and avoid surprises as you move from concept to creation.</li>
            <li><strong className="text-charcoal font-medium">Collaborate on sketches and 3D concepts:</strong> our design process includes visual concepts to ensure your design is on the right track before crafting begins.</li>
          </ol>
          <p>
            The goal is a design that reflects your personality as you walk down the aisle and remains
            meaningful long after the celebration.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Our bespoke process and typical timeline</h2>
          <p className="mb-4">
            Commissioning a bespoke piece with Miozuki follows a structured but flexible process. While
            exact timelines vary by design (roughly 4 to 6 weeks), the typical journey includes concept
            development, material selection, CAD or hand-drawn renderings, approval of a 3D model or
            sketch, crafting, and a final fitting. We work closely with you at each stage to ensure
            precision and satisfaction.
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li><strong className="text-charcoal font-medium">Discovery &amp; design:</strong> an initial consultation to capture your vision, preferences, and budget.</li>
            <li><strong className="text-charcoal font-medium">Concept &amp; renderings:</strong> you&apos;ll review sketches or 3D renders to confirm the direction.</li>
            <li><strong className="text-charcoal font-medium">Material selection &amp; pricing:</strong> we finalise stones, settings, and metal tone, followed by a formal quote.</li>
            <li><strong className="text-charcoal font-medium">Crafting:</strong> skilled artisans handcraft your piece with meticulous attention to detail.</li>
            <li><strong className="text-charcoal font-medium">Proofing &amp; adjustments:</strong> a fitting or review ensures comfort and proportions before final completion.</li>
            <li><strong className="text-charcoal font-medium">Delivery &amp; aftercare:</strong> your bespoke treasure is delivered with care instructions and ongoing support.</li>
          </ul>
          <p>
            Lead times vary by project scope, but we aim for transparent scheduling from concept to
            completion. If you need a piece for a specific date, share your timeline early so we can
            plan accordingly.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Pricing overview for custom bridal jewellery</h2>
          <p className="mb-4">
            Because bespoke pieces are designed to your exact specifications, pricing for custom bridal
            jewellery is determined by design complexity, choice of stones, and the level of handcraft
            required. A bespoke engagement ring or bridal set may range based on the design and
            materials chosen. In practice, buyers invest in pieces that balance personal significance
            with lasting value.
          </p>
          <p>
            Our bespoke pricing is transparent. You will receive a detailed quote after initial
            discovery, and you&apos;re never obligated to proceed with a design you&apos;re not fully
            excited about.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Buying guide: starting your custom bridal jewellery journey</h2>
          <ol className="list-decimal pl-5 space-y-2 mb-4">
            <li><strong className="text-charcoal font-medium">Clarify your vision:</strong> define which pieces you want to commission and what they should express about you and your wedding theme.</li>
            <li><strong className="text-charcoal font-medium">Choose your stones &amp; style:</strong> decide between moissanite and pearls or a combination, and select a silhouette you love.</li>
            <li><strong className="text-charcoal font-medium">Schedule a discovery session:</strong> connect with Miozuki&apos;s NZ-based team to discuss your ideas and feasibility.</li>
            <li><strong className="text-charcoal font-medium">Review designs &amp; quotes:</strong> approve sketches or renders and a formal price before any crafting begins.</li>
            <li><strong className="text-charcoal font-medium">Await craftsmanship with periodic updates:</strong> stay involved with the process as your piece comes to life.</li>
            <li><strong className="text-charcoal font-medium">Receive your bespoke piece with care guidance:</strong> learn how to care for moissanite and pearls to preserve brilliance for a lifetime.</li>
          </ol>
          <p>
            Ready to begin? Explore the{' '}
            <Link href="/pages/bespoke-order" className={linkClass}>bespoke order page</Link>{' '}
            to start your custom order, or{' '}
            <Link href="/pages/appointment-online" className={linkClass}>book a one-on-one consultation</Link>{' '}
            to refine your idea.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">About the maker: Miozuki</h2>
          <p className="mb-4">
            Miozuki Moissanite &amp; Pearl Fine Jewellery NZ is a small New Zealand jewellery brand
            focused on accessible luxury and custom creations. Our founder,{' '}
            <Link href="/pages/our-founder" className={linkClass}>Ting Eguchi</Link>, leads a studio
            dedicated to crafting fine pieces that celebrate individuality. When you choose a bespoke
            order with Miozuki, you&apos;re partnering with designers who translate your story into
            wear-anywhere jewellery designed to last.
          </p>
          <p>
            The bespoke path is at the heart of what we do in bridal jewellery. We invite you to bring
            your inspiration, and we&apos;ll collaborate on a design that reflects your personal
            narrative, from engagement to wedding day and beyond.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {FAQS.map((f) => (
              <div key={f.q}>
                <h3 className="text-charcoal font-medium mb-1">{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
