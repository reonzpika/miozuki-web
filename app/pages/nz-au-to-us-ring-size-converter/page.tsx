import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'NZ/AU to US Ring Size & MM Converter | Miozuki',
  description:
    'Convert New Zealand and Australian alphabetical ring sizes to US numbers and millimetres, with a full size chart and how-to-measure guide.',
};

// Conversion data transcribed verbatim from the live Miozuki size chart image.
const SIZE_ROWS: [string, string, string, string][] = [
  ['48', '15.27', 'I 1/2', '4.5'],
  ['49', '15.7', 'J 1/2', '5'],
  ['51', '16.1', 'L', '5.5'],
  ['52', '16.51', 'M', '6'],
  ['53', '16.92', 'N', '6.5'],
  ['55', '17.35', 'O', '7'],
  ['56', '17.75', 'P', '7.5'],
  ['57', '18.19', 'Q', '8'],
  ['58', '18.53', 'Q 1/2', '8.5'],
  ['59', '18.89', 'R 1/2', '9'],
  ['61', '19.41', 'S 1/2', '9.5'],
  ['62', '19.84', 'T 1/2', '10'],
  ['63', '20.2', 'U 1/2', '10.5'],
  ['65', '20.68', 'V 1/2', '11'],
  ['66', '21.08', 'W 1/2', '11.5'],
  ['68', '21.49', 'Y', '12'],
  ['69', '21.89', 'Z', '12.5'],
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'What if I am between sizes?',
    a: 'If you fall between two sizes on the chart, we generally recommend sizing down for thin, delicate bands (common in moissanite jewellery) and sizing up for wider, thicker bands.',
  },
  {
    q: 'Does Miozuki offer a physical ring sizer?',
    a: 'Yes. We offer a $1 physical ring sizer that can be mailed to your NZ address. The best part? The $1 cost is credited toward your future custom or bespoke ring purchase with us.',
  },
  {
    q: 'How do I measure for a surprise proposal?',
    a: 'The best way is to borrow a ring your partner currently wears on their ring finger (left hand) and use the Inner Diameter method described above. Alternatively, ask a close friend or family member if they know the size.',
  },
  {
    q: 'Does warmer weather affect ring size?',
    a: 'Absolutely. Heat causes fingers to swell. If you are measuring during a hot NZ summer, your fingers might be a half-size larger than they are in winter. Try to measure on a day with moderate temperature for the most all-season fit.',
  },
];

export default function RingSizeConverterPage() {
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
        <span>Ring Size Converter</span>
      </nav>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-4">
        The Definitive NZ/AU to US Ring Size &amp; MM Converter
      </h1>
      <p className="text-sm text-charcoal/55 leading-relaxed mb-10">
        Finding your perfect fit shouldn&apos;t be a guessing game. Use our comprehensive conversion
        guide to transition between New Zealand&apos;s alphabetical sizing and international numerical
        standards for your next Miozuki fine jewellery piece.
      </p>

      <div className="h-px bg-charcoal/8 mb-10" />

      <div className="space-y-10 text-sm text-charcoal/65 leading-relaxed">

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Why Ring Sizing Matters for Fine Jewellery</h2>
          <p className="mb-4">
            In the world of fine jewellery, precision is everything. Whether you are eyeing a
            moissanite solitaire or a delicate set of pearl-adorned bands, the comfort and security of
            your ring depend on an accurate measurement. At{' '}
            <strong className="text-charcoal font-medium">Miozuki</strong>, we specialise in
            accessible luxury, bringing moissanite and pearl fine jewellery to the New Zealand and
            Australian markets. Because we often work with international standards, understanding how
            your NZ &quot;Letter&quot; size translates to US &quot;Numbers&quot; or millimetres (mm)
            is essential.
          </p>
          <p>
            New Zealand and Australia traditionally follow the British alphabetical system (A-Z).
            However, many moissanite stones and modern bridal settings are calibrated using the US
            numerical system. This guide bridges that gap, ensuring your bespoke ring fits perfectly
            from the moment it arrives.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-3">The Official Size Conversion Chart</h2>
          <p className="mb-4">Use the table below to find your equivalent size.</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-charcoal/5">
                  <th className="border border-charcoal/10 px-3 py-2 font-medium text-charcoal">Inside Circumference (approx. mm)</th>
                  <th className="border border-charcoal/10 px-3 py-2 font-medium text-charcoal">Inside Diameter (approx. mm)</th>
                  <th className="border border-charcoal/10 px-3 py-2 font-medium text-charcoal">UK, Australia, NZ</th>
                  <th className="border border-charcoal/10 px-3 py-2 font-medium text-charcoal">US &amp; Canada</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_ROWS.map(([circ, dia, nz, us]) => (
                  <tr key={us}>
                    <td className="border border-charcoal/8 px-3 py-2 text-charcoal/70">{circ}</td>
                    <td className="border border-charcoal/8 px-3 py-2 text-charcoal/70">{dia}</td>
                    <td className="border border-charcoal/8 px-3 py-2 text-charcoal/70">{nz}</td>
                    <td className="border border-charcoal/8 px-3 py-2 text-charcoal/70">{us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">How to Measure Your Ring Size at Home</h2>
          <div className="mb-6">
            <h3 className="text-charcoal font-medium mb-2">Method 1: The String / Paper Test</h3>
            <p className="mb-3">This method measures the <strong className="text-charcoal font-medium">circumference</strong> of your finger.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Cut a thin strip of paper or a piece of non-stretchy string.</li>
              <li>Wrap it snugly around the base of your finger and the widest part of your knuckle.</li>
              <li>Mark the exact point where the ends meet.</li>
              <li>Lay the paper/string flat and measure the distance in millimetres with a ruler.</li>
              <li>Check the &quot;Inside Circumference&quot; column in our chart above.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-charcoal font-medium mb-2">Method 2: The Existing Ring Test</h3>
            <p className="mb-3">This method measures the <strong className="text-charcoal font-medium">inner diameter</strong> of a ring you already own.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Select a ring that fits the specific finger you are shopping for.</li>
              <li>Place the ring on a ruler and measure the distance across the <strong className="text-charcoal font-medium">inside</strong> of the circle.</li>
              <li>Do not include the metal of the band in your measurement.</li>
              <li>Compare the millimetre reading to our &quot;Inside Diameter&quot; column.</li>
            </ul>
          </div>
        </div>

        <div className="bg-charcoal/4 px-5 py-5">
          <h2 className="font-serif text-xl text-charcoal mb-3">Order Our $1 Ring Sizer</h2>
          <p className="text-charcoal/70 mb-3">
            Each Miozuki ring is made just for you, so we recommend ordering our ring sizer first to
            ensure the perfect fit. Please allow approximately 4 weeks lead time.
          </p>
          <Link
            href="/products/order-your-ring-sizer-credited-toward-your-custom-bespoke-ring"
            className="text-xs tracking-widest uppercase text-burgundy underline underline-offset-4 hover:text-burgundy/70 transition-colors"
          >
            Order a ring sizer
          </Link>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Pro-Tips for an Accurate Fit</h2>
          <div className="mb-5">
            <h3 className="text-charcoal font-medium mb-2">The &quot;Evening Measure&quot; Rule</h3>
            <p>
              Fingers tend to change size throughout the day. They are often smaller in the morning
              and swell during the evening or in warmer weather. For the most reliable fit, measure
              your finger at the end of the day when your hands are warm.
            </p>
          </div>
          <div className="mb-5">
            <h3 className="text-charcoal font-medium mb-2">Consider the Band Width</h3>
            <p className="mb-3">The width of the ring band affects how it feels on your finger.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-charcoal font-medium">Fine bands (1.5mm - 2mm):</strong> Most Miozuki moissanite rings feature delicate, elegant bands. These typically fit true to size.</li>
              <li><strong className="text-charcoal font-medium">Wide bands (5mm+):</strong> If you are choosing a wider &quot;cigar&quot; style band or a thick bridal stack, we recommend sizing up by half a size (one NZ letter) to ensure comfort.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-charcoal font-medium mb-2">Moissanite &amp; Top-Heavy Designs</h3>
            <p>
              Because moissanite is a high-refractive stone often featured in solitaire settings,
              these rings can sometimes be top-heavy. A ring that is too loose will cause the stone to
              spin to the side of your finger. We recommend a snug fit, where the ring slides over the
              knuckle with a small amount of resistance but sits comfortably at the base.
            </p>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-xl text-charcoal mb-4">Average Sizes in NZ &amp; Australia</h2>
          <p className="mb-3">
            If you are purchasing a gift and cannot measure the person&apos;s finger, statistics for
            the NZ/AU market can help guide your choice:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-charcoal font-medium">Average woman:</strong> most commonly sizes N to P (US 6.5 to 7.5).</li>
            <li><strong className="text-charcoal font-medium">The &quot;safe&quot; bet:</strong> for a woman of average build, a US size 6 or 7 (NZ M 1/2 or O 1/2) is the most statistically frequent size for engagement rings.</li>
            <li><strong className="text-charcoal font-medium">Average man:</strong> most commonly sizes T to W (US 9.5 to 11).</li>
          </ul>
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
