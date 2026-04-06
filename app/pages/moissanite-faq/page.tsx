import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Moissanite FAQ — Miozuki',
  description:
    'Everything you need to know about moissanite — the ethical, brilliant diamond alternative.',
};

const SECTIONS = [
  {
    heading: 'What Is Moissanite? Composition & Origins',
    body: `Moissanite is a real gemstone composed of silicon and carbon (chemical formula SiC). Henri Moissan discovered minute crystals of this mineral in a meteor crater in 1893; however, natural moissanite is too rare for jewellery, so today's moissanite is lab-grown.

Moissanite's popularity comes from a blend of advantages:

• Brilliant fire and sparkle — its refractive index (2.65–2.69) creates rainbow flashes that can outshine a diamond.
• Exceptional durability — a hardness of 9.25 on the Mohs scale makes moissanite one of the hardest gemstones, second only to diamond.
• Ethical & sustainable — lab growth avoids land disruption, water consumption, and conflict concerns linked to diamond mining.
• Affordable luxury — moissanite offers high-end sparkle at a more accessible price.`,
  },
  {
    heading: 'Is Moissanite a Real Diamond?',
    body: `No. Although moissanite looks similar to diamond, the two gems differ. Moissanite is silicon carbide; diamond is pure carbon. To the naked eye, high-quality moissanite appears nearly identical to a diamond, but they have distinct optical and physical properties.`,
  },
  {
    heading: 'Is Moissanite Durable Enough for Engagement Rings?',
    body: `Yes. Moissanite ranks 9.25 on the Mohs hardness scale, making it less prone to chipping and breaking. With proper care, moissanite engagement rings, wedding bands, and other jewellery will retain their brilliance and resist abrasions for decades.`,
  },
  {
    heading: 'Why Does Moissanite Sparkle More Than Diamond?',
    body: `Sparkle depends on a gemstone's refractive index — its ability to bend light. Moissanite's refractive index of 2.65–2.69 surpasses diamond's 2.42. This means moissanite rings and earrings will always deliver eye-catching brilliance, especially in mixed lighting.`,
  },
  {
    heading: 'Does Moissanite Get Cloudy?',
    body: `No. Moissanite is highly resistant to cloudiness because its crystal structure lacks internal oils or coatings. It withstands heat and daily wear without becoming hazy. With regular gentle cleaning, it retains its clarity indefinitely.`,
  },
  {
    heading: 'Is Moissanite Ethical & Sustainable?',
    body: `Yes. Lab-grown moissanite avoids the environmental damage and human rights issues often linked to diamond mining. Diamond extraction can destroy ecosystems, cause deforestation, and consume large amounts of water and energy. Moissanite's lab origin means transparent supply chains and a clear conscience.`,
  },
  {
    heading: 'Why Choose Moissanite vs Diamond?',
    body: `Shoppers choose moissanite for several reasons:

• Brilliance & fire — its high refractive index creates dazzling sparkle.
• Durability — 9.25 Mohs hardness and no cleavage plane make it strong for everyday wear.
• Ethical peace of mind — lab-grown origins eliminate conflict and reduce environmental impact.
• Affordability — moissanite offers a diamond-like appearance at a fraction of the cost.

Choosing moissanite isn't about replacing diamonds; it's about selecting a gemstone that matches your values, budget, and aesthetic.`,
  },
  {
    heading: 'Moissanite Care Tips',
    body: `• Clean regularly — use warm water, mild dish soap, and a soft brush to remove oils and dirt.
• Store separately — keep moissanite pieces away from harder stones and rough surfaces to avoid scratches.
• Avoid harsh chemicals — remove jewellery when using household cleaners or applying lotions to maintain lustre.

With proper care, moissanite retains its brilliance and sparkle for generations.`,
  },
];

export default function MoissaniteFaqPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 md:px-10 py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/40 mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <span>Moissanite FAQ</span>
      </nav>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-4">
        Moissanite FAQ
      </h1>
      <p className="text-sm text-charcoal/55 leading-relaxed mb-10">
        The ethical diamond alternative — everything you need to know about moissanite
        composition, durability, sparkle, and sustainability.
      </p>

      <div className="h-px bg-charcoal/8 mb-10" />

      <div className="divide-y divide-charcoal/8">
        {SECTIONS.map(({ heading, body }) => (
          <div key={heading} className="py-8">
            <h2 className="font-serif text-xl text-charcoal mb-4">{heading}</h2>
            <div className="space-y-3">
              {body.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm text-charcoal/65 leading-relaxed whitespace-pre-line">
                  {para}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-charcoal/8">
        <Link
          href="/collections/moissanite-rings"
          className="text-xs tracking-widest uppercase text-burgundy hover:text-burgundy/70 transition-colors underline underline-offset-4"
        >
          Shop Moissanite Rings
        </Link>
      </div>
    </main>
  );
}
