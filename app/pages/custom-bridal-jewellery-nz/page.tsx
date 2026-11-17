import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Custom Bridal Jewellery NZ (Bespoke Orders) | Miozuki',
  description:
    'Enquire about custom bridal jewellery in New Zealand. Explore moissanite and freshwater pearl options and allow 3–5 weeks for production and delivery.',
  alternates: { canonical: '/pages/custom-bridal-jewellery-nz' },
};

const linkClass =
  'text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors';

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Can I design custom bridal jewellery from scratch?',
    a: 'Tell me what you have in mind. I’m happy to chat through the possibilities and check what can be made within your budget and timeframe.',
  },
  {
    q: 'How do I choose between a classic and a modern style?',
    a: 'Start with your dress, the jewellery you already wear and how you want the piece to feel. Share a few examples you like so we can talk through your options.',
  },
  {
    q: 'Can you match my engagement ring or wedding dress style?',
    a: 'Send a photo of your engagement ring or dress with your enquiry. We can talk through which shapes, settings and metal colours might suit it, then check what is possible.',
  },
  {
    q: 'What stones are available for custom pieces?',
    a: 'Miozuki specialises in moissanite and freshwater pearls. If you want to use a stone you already own, mention it in your enquiry so we can check whether that work is available.',
  },
  {
    q: 'How long does a bespoke piece take?',
    a: 'Allow 3–5 weeks for production and delivery. If you are ordering for a wedding, share your date when you enquire so we can confirm the timing for your piece.',
  },
  {
    q: 'How is pricing determined?',
    a: 'The quote depends on the design and materials. Share your budget when you enquire and confirm the quote, what it covers and the payment terms before ordering.',
  },
  {
    q: 'Do you provide aftercare and adjustments?',
    a: 'Ask what aftercare is available for your piece, including whether adjustments are possible and whether there is a charge.',
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
        Have a piece in mind for your wedding? Tell us what you’d like to wear, your budget and
        when you need it. Miozuki specialises in moissanite and freshwater pearl jewellery. We’ll
        talk through your ideas and check which custom options are available.
      </p>

      <div className="h-px bg-charcoal/8 mb-10" />

      <div className="space-y-10 text-sm text-charcoal/65 leading-relaxed">

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">What is custom bridal jewellery?</h2>
          <p className="mb-4">
            Custom bridal jewellery refers to pieces designed specifically for you, tailored to your
            style, story, and preferences. Instead of selecting a pre-made piece, you partner with a
            jeweller to explore a design for a ring, a pair of earrings or a pendant. If you have a
            particular stone shape in mind, or want to use a stone you already own, ask what is
            possible when you enquire.
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
            <li>Room to explore stone size, shape and how much sparkle you want.</li>
            <li>A design that complements the engagement ring and wedding dress, rather than matching a generic set.</li>
            <li>Craftsmanship and attention to comfort, weight, and wearability on the wedding day and beyond.</li>
            <li>A chance to discuss details that have personal meaning for you.</li>
          </ul>
          <p>
            Share a photo of any jewellery you plan to wear on the day. It can help us talk through
            how a new piece might sit alongside it.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Types of custom bridal jewellery</h2>
          <div className="mb-5">
            <h3 className="text-charcoal font-medium mb-2">Rings: bespoke engagement rings and wedding rings</h3>
            <p>
              For an engagement ring or wedding band, tell us your ring size if you know it and
              how you plan to wear the ring. If you want two rings to sit together, include a
              photo of the ring you already have so we can discuss shape and fit.
            </p>
          </div>
          <div className="mb-5">
            <h3 className="text-charcoal font-medium mb-2">Bridal sets: coordinating individual pieces</h3>
            <p>
              You can build a bridal set by coordinating individual pieces. If you’d like a
              piece to complement jewellery you already have, share what you plan to wear so we
              can discuss suitable options.
            </p>
          </div>
          <div className="mb-5">
            <h3 className="text-charcoal font-medium mb-2">Earrings: from delicate studs to statement drops</h3>
            <p>
              If you’re considering studs or drops, share the length and weight you’d feel
              comfortable wearing. Ask which styles are available in moissanite or pearl.
            </p>
          </div>
          <div>
            <h3 className="text-charcoal font-medium mb-2">Necklaces &amp; pendants: personal pieces for the wedding day</h3>
            <p>
              Share your neckline and preferred chain length if you’re considering a necklace or
              pendant. A photo of your dress can help when discussing where the piece might sit.
            </p>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Materials and stones we specialise in</h2>
          <p className="mb-4">
            Miozuki specialises in moissanite and freshwater pearls. Moissanite offers bright
            sparkle, while pearls have a softer lustre and need gentler care. Ask which materials
            suit the piece and how often you plan to wear it.
          </p>
          <p>
            Tell us your preferred stone shape, size and metal colour in your enquiry. We can
            check which combinations are available for your design.
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
            <li><strong className="text-charcoal font-medium">Consider wearability and setting:</strong> tell us whether you plan to wear the piece every day and share any concerns about fit, weight or comfort.</li>
            <li><strong className="text-charcoal font-medium">Set a budget and timeline:</strong> bespoke projects have flexible scopes. Early discussions help align expectations and avoid surprises as you move from concept to creation.</li>
            <li><strong className="text-charcoal font-medium">Ask how the design will be confirmed:</strong> check what details you can review before deciding whether to order.</li>
          </ol>
          <p>
            The goal is a design that reflects your personality as you walk down the aisle and remains
            meaningful long after the celebration.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Our bespoke process and typical timeline</h2>
          <p className="mb-4">
            Please allow 3–5 weeks for production and delivery of your made-to-order piece. When
            you enquire, we’ll talk through your idea and check what is possible.
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Discuss the materials, dimensions and options available for your design.</li>
            <li>Confirm what you can review before ordering, along with the quote and payment terms.</li>
            <li>Ask about delivery for your address and any aftercare or adjustments you may need.</li>
          </ul>
          <p>
            If you need your piece by a specific date, share it when you enquire so we can confirm
            the timing for your design.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Pricing overview for custom bridal jewellery</h2>
          <p className="mb-4">
            Pricing depends on the design and materials. Include your budget in your enquiry so
            we can discuss the options. Before placing an order, confirm what the quote includes
            and when payment is due.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Start your bespoke enquiry</h2>
          <p>
            Share your idea, budget and wedding date through the{' '}
            <Link href="/pages/bespoke-order" className={linkClass}>Custom Made enquiry form</Link>.
            For advice or help with ring sizing, you can also{' '}
            <Link href="/pages/appointment-online" className={linkClass}>book an appointment</Link>.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">About Miozuki</h2>
          <p>
            Miozuki is an Auckland-based jewellery brand founded by{' '}
            <Link href="/pages/our-founder" className={linkClass}>Ting Eguchi</Link>, specialising
            in moissanite and pearl jewellery.
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
