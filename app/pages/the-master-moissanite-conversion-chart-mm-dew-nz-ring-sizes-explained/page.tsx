import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'The Master Moissanite Conversion Chart: mm, DEW & NZ Ring Sizes | Miozuki',
  description:
    'Convert moissanite millimetre sizes to Diamond Equivalent Weight (DEW) and actual carat weight, with round, oval, and princess cut charts and NZ ring sizing.',
};

const linkClass =
  'text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors';

const ROUND_ROWS: string[][] = [
  ['4.0 mm', '0.25 ct', '~0.23 ct', 'Subtle Studs / Side Stones'],
  ['5.0 mm', '0.50 ct', '~0.46 ct', 'Minimalist Solitaires'],
  ['6.0 mm', '0.85 ct', '~0.78 ct', 'Classic Engagement Rings'],
  ['6.5 mm', '1.00 ct', '~0.91 ct', 'Standard 1-Carat Look'],
  ['7.0 mm', '1.20 ct', '~1.10 ct', 'Premium Solitaire'],
  ['7.5 mm', '1.50 ct', '~1.35 ct', 'Impressive Brilliance'],
  ['8.0 mm', '2.00 ct', '~1.80 ct', 'Bold Statement Rings'],
  ['9.0 mm', '2.70 ct', '~2.26 ct', 'Luxury Premium'],
];

const OVAL_ROWS: string[][] = [
  ['6 x 4 mm', '0.50 ct'],
  ['7.8 x 5.7 mm', '1.00 ct'],
  ['8.5 x 6.5 mm', '1.50 ct'],
  ['9.61 x 7.1 mm', '2.00 ct'],
  ['11 x 8 mm', '3.00 ct'],
];

const PRINCESS_ROWS: string[][] = [
  ['4.0 mm', '0.40 ct'],
  ['5.0 mm', '0.75 ct'],
  ['5.5 mm', '1.00 ct'],
  ['6.5 mm', '1.50 ct'],
  ['7.0 mm', '2.00 ct'],
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Why is moissanite lighter than diamond?',
    a: 'Moissanite is a different mineral (silicon carbide) than diamond (carbon). Its molecular structure is less dense, meaning that while it looks identical or even more brilliant to the naked eye, it weighs less than a diamond of the same physical volume.',
  },
  {
    q: 'Will a 1ct DEW moissanite fit in a diamond setting?',
    a: 'Yes. Because DEW is calculated based on the physical dimensions (e.g. 6.5mm for a 1ct round), a 1ct DEW moissanite will fit perfectly into a standard 1-carat diamond setting.',
  },
  {
    q: 'How do I measure my ring size at home?',
    a: 'While there are DIY methods using string or paper, they are often inaccurate. We highly recommend ordering our $1 ring sizer from the Miozuki store. It is the most reliable way to find your NZ alphabetical size before ordering.',
  },
  {
    q: 'What is the most popular moissanite size in New Zealand?',
    a: 'The 1.5ct DEW (7.5mm) and 2.0ct DEW (8.0mm) are currently very popular in NZ. They offer a luxurious, eye-catching presence while remaining elegant and wearable for everyday use.',
  },
  {
    q: 'Does moissanite lose its sparkle over time?',
    a: 'No. Moissanite is a very hard gemstone (9.25 on the Mohs scale). It does not cloud or lose its brilliance over time. Regular cleaning with mild soap and water will keep it looking brand new.',
  },
];

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-charcoal/5">
            {headers.map((h) => (
              <th key={h} className="border border-charcoal/10 px-3 py-2 font-medium text-charcoal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]}>
              {r.map((cell, i) => (
                <td key={i} className="border border-charcoal/8 px-3 py-2 text-charcoal/70">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MoissaniteConversionChartPage() {
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

      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/40 mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <span>Moissanite Conversion Chart</span>
      </nav>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-4">
        The Master Conversion Chart
      </h1>
      <p className="text-sm text-charcoal/55 leading-relaxed mb-10">
        Your comprehensive technical guide to moissanite millimetres, Diamond Equivalent Weight
        (DEW), and New Zealand ring sizing.
      </p>

      <div className="h-px bg-charcoal/8 mb-10" />

      <div className="space-y-10 text-sm text-charcoal/65 leading-relaxed">

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Understanding Moissanite Measurements</h2>
          <p className="mb-4">
            When shopping for fine jewellery at Miozuki, you may notice that moissanite is often
            described by its physical dimensions in millimetres (mm) rather than its carat weight. This
            is a crucial distinction for both technical accuracy and consumer transparency. While
            diamonds are traditionally sold by weight (carats), moissanite is a unique gemstone with
            its own physical properties.
          </p>
          <p className="mb-6">
            The primary reason for using the{' '}
            <strong className="text-charcoal font-medium">Diamond Equivalent Weight (DEW)</strong> is
            the difference in density between the two stones. Moissanite is approximately 10% to 15%
            lighter than a diamond of the same size. Therefore, a moissanite stone that measures
            6.5mm, the standard size for a 1.00-carat round brilliant diamond, will actually weigh
            significantly less on a scale. To help our New Zealand customers compare visual size
            effectively, the DEW system provides a familiar reference point.
          </p>
          <h3 className="text-charcoal font-medium mb-2">Technical Fact: Density Comparison</h3>
          <p>
            The specific gravity (density) of a diamond is approximately{' '}
            <strong className="text-charcoal font-medium">3.52 g/cm³</strong>, whereas the specific
            gravity of moissanite is approximately{' '}
            <strong className="text-charcoal font-medium">3.22 g/cm³</strong>. This scientific variance
            means that if you were to buy a 1.00-carat moissanite by weight alone, it would physically
            look much larger than a 1.00-carat diamond. By using DEW, we ensure that when you order a
            1.00ct DEW stone, it fits perfectly into settings designed for 1.00-carat diamonds.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-3">Round Brilliant Moissanite Conversion Chart</h2>
          <p className="mb-4">
            The Round Brilliant cut is the most popular choice for engagement rings and studs. Below is
            the master conversion guide for round stones, ranging from subtle accents to statement
            centrepieces.
          </p>
          <DataTable
            headers={['Millimetre Size (mm)', 'Diamond Equivalent Weight (DEW)', 'Estimated Actual Weight (ct)', 'Best Used For']}
            rows={ROUND_ROWS}
          />
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-3">Fancy Cut Conversion Guide</h2>
          <p className="mb-6">
            Fancy shapes like ovals, pears, and princess cuts carry their weight differently. An oval
            moissanite often provides a larger face-up appearance than a round stone of the same
            weight, making it an excellent choice for those wanting to maximise their visual impact on
            a budget.
          </p>
          <h3 className="text-charcoal font-medium mb-3">Oval Cut (Length x Width)</h3>
          <div className="mb-6">
            <DataTable headers={['Dimensions (mm)', 'DEW (Carats)']} rows={OVAL_ROWS} />
          </div>
          <h3 className="text-charcoal font-medium mb-3">Princess Cut (Square)</h3>
          <DataTable headers={['Dimensions (mm)', 'DEW (Carats)']} rows={PRINCESS_ROWS} />
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">New Zealand Alphabetical Ring Sizing</h2>
          <p className="mb-4">
            In New Zealand, we use the British/Australian alphabetical ring sizing system. Finding the
            perfect moissanite stone is only half the journey; ensuring a comfortable fit is essential
            for a lifetime of wear. If you are unsure of your size, we offer a{' '}
            <Link href="/products/order-your-ring-sizer-credited-toward-your-custom-bespoke-ring" className={linkClass}>$1 ring sizer</Link>{' '}
            that includes a credit (ring sizer plus shipping) toward your future custom or bespoke ring
            order.
          </p>
          <p>
            For the full mm, diameter, and NZ-to-US size conversion, see our{' '}
            <Link href="/pages/nz-au-to-us-ring-size-converter" className={linkClass}>ring size converter</Link>.
            Half sizes (e.g. M½) are also available for many of our bespoke designs to ensure the
            ultimate fit.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Why Accurate Conversion Matters</h2>
          <p className="mb-4">
            Choosing the right stone size involves more than just aesthetics. For residents in NZ
            looking for accessible luxury, understanding the mm to DEW conversion ensures:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li><strong className="text-charcoal font-medium">Proportion:</strong> knowing how a 7mm stone will sit on a Size M finger.</li>
            <li><strong className="text-charcoal font-medium">Budgeting:</strong> moissanite offers a significantly higher size-to-price ratio than diamonds, but comparing them accurately requires DEW data.</li>
            <li><strong className="text-charcoal font-medium">Setting Integrity:</strong> if you are purchasing a loose stone for an existing setting, the millimetre measurement is the only metric that guarantees a fit.</li>
          </ul>
          <p>
            Miozuki is committed to accessible luxury. By providing this master chart, we empower our
            customers to make informed decisions that align with their personal style and ethical
            values.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">The Science Behind the Sparkle: Why Millimetres Matter</h2>
          <p className="mb-4">
            When selecting a moissanite stone, the millimetre measurement provides a true indication of
            the stone&apos;s surface area. In the world of optics, this is known as the face-up size.
            Unlike carats, which measure mass, millimetres measure geometry. This is vital because two
            stones with the same carat weight could have different millimetre measurements depending on
            how deep or shallow they are cut. A deep-cut stone hides its weight in the bottom
            (pavilion), while a shallow-cut stone might look large but lack the brilliance and fire
            moissanite is famous for.
          </p>
          <p className="mb-4">
            Miozuki ensures that all our moissanite stones are cut to ideal proportions. By adhering to
            the standards in our Master Conversion Chart, we guarantee that the fire (dispersion) and
            brilliance (refractive index) of our stones are maximised. Moissanite actually has a higher
            refractive index (2.65 to 2.69) than a diamond (2.42), meaning it reflects more light and
            produces more rainbow flashes. When you choose a stone based on our mm-to-DEW chart, you
            are choosing a stone optimised for these incredible optical properties.
          </p>
          <p>
            Whether you are in Auckland, Wellington, Christchurch, or anywhere else in Aotearoa, our
            goal is to provide a transparent, luxury experience. Using the Diamond Equivalent Weight
            allows you to compare our ethical, lab-grown gemstones directly with traditional mined
            diamonds, highlighting the exceptional value moissanite provides without compromising on
            the visual scale of your jewellery.
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
