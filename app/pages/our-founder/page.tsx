import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Our Founder — Miozuki',
  description:
    'Meet Ting Eguchi, founder of Miozuki fine jewellery, Auckland NZ.',
};

export default function OurFounderPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 md:px-10 py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/40 mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <span>Our Founder</span>
      </nav>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-4">
        Our Founder
      </h1>

      <div className="h-px bg-charcoal/8 mb-10" />

      <p className="text-sm text-charcoal/70 leading-relaxed mb-10">
        Kia Ora, I&apos;m Ting Eguchi, the founder of Miozuki. From my studio in Auckland,
        each piece is carefully prepared and wrapped — with the same intention that goes into
        choosing every piece. Thank you for finding your way here, and for supporting this
        small, heartfelt brand. Your presence is now part of its story.
      </p>

      {/* Founder image */}
      <div className="relative aspect-square w-64 mx-auto mb-10 overflow-hidden">
        <Image
          src="https://cdn.shopify.com/s/files/1/0797/0819/3023/files/PXL_20241230_060931026_3_480x480.jpg?v=1767920670"
          alt="Ting Eguchi, founder of Miozuki"
          fill
          className="object-cover object-top"
        />
      </div>

      <blockquote className="border-l-2 border-burgundy/30 pl-6 mb-10 space-y-4">
        <p className="text-sm text-charcoal/70 leading-relaxed italic">
          &ldquo;Miozuki was born during a trip to Japan, after I picked a fortune slip at a shrine.
          The words stayed with me, gently guiding me toward finding a quiet confidence that
          already existed in me.
        </p>
        <p className="text-sm text-charcoal/70 leading-relaxed italic">
          It is not loud, but begins with self-belief — the kind that comes when we accept our
          imperfections and embrace our contrasting sides: the soft and the strong, the
          vulnerability and the resilience.
        </p>
        <p className="text-sm text-charcoal/70 leading-relaxed italic">
          I created Miozuki to honour this philosophy — just like our pearl and moissanite
          jewellery. Miozuki is for the woman who glows like the moon, flows like water —
          graceful, yet unforgettable.&rdquo;
        </p>
      </blockquote>

      <div className="h-px bg-charcoal/8 my-10" />

      <blockquote className="space-y-4 mb-10">
        <p className="text-sm text-charcoal/60 leading-relaxed">
          Outside of Miozuki, I find inspiration in the small, joyful moments that are so
          often overlooked. As an introvert, I enjoy journaling and meditation, and always
          decorate the house with colourful flowers from the Sunday market.
        </p>
        <p className="text-sm text-charcoal/60 leading-relaxed">
          My mornings usually begin with a French-pressed black coffee, brewed from freshly
          ground local beans. Afternoons are for rose tea, mingling the scent with diffused
          essential oils that turn the room into a space for more creative moments.
        </p>
        <p className="text-sm text-charcoal/60 leading-relaxed">
          It is within these simple rituals that I find joy, beauty, and creativity — a
          reminder that the quietest glow often shines the longest.
        </p>
      </blockquote>

      <p className="text-sm text-charcoal/70 italic font-serif text-lg">
        With All My Heart,<br />
        <span className="not-italic font-normal">Ting Eguchi</span>
      </p>
    </main>
  );
}
