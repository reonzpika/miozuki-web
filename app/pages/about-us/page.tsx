import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Miozuki, Fine Jewellery NZ',
  description:
    'Miozuki is a Japanese-inspired fine jewellery brand based in Auckland, New Zealand, specialising in moissanite and pearl pieces.',
};

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 md:px-10 py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-charcoal/65 mb-10">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span>/</span>
        <span>About Us</span>
      </nav>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight mb-8">
        About Miozuki
      </h1>

      <div className="h-px bg-charcoal/8 mb-10" />

      <blockquote className="border-l-2 border-burgundy/30 pl-6 mb-10">
        <p className="font-serif text-xl text-charcoal/80 italic leading-relaxed mb-4">
          Miozuki 澪月: Waterway to the Moon
        </p>
        <p className="text-sm text-charcoal/65 leading-relaxed mb-4">
          &ldquo;The story began with a fortune slip at a shrine in Fukuoka, Japan in 2025, a small
          piece of paper that quietly changed everything.
        </p>
        <p className="text-sm text-charcoal/65 leading-relaxed mb-4">
          I still remember the calm I felt as I read it:
        </p>
        <p className="text-sm text-charcoal/70 italic leading-relaxed mb-4">
          &ldquo;Even at the deepest part of the sea, if the water remains clear and still, the
          moonlight will always find its way to you.&rdquo;
        </p>
        <p className="text-sm text-charcoal/65 leading-relaxed">
          Those words stayed with me, and became the story of the brand.&rdquo;
        </p>
      </blockquote>

      <div className="space-y-5 text-sm text-charcoal/70 leading-relaxed">
        <p>
          Miozuki is a Japanese-inspired fine jewellery brand based in Auckland, New Zealand.
          We believe <strong className="text-charcoal font-medium">true beauty lives in contrast</strong>,
          our mission is to bring the quiet yet powerful strength within every woman - it
          isn&apos;t loud, but softly shines.
        </p>
        <p>
          The Japanese word stands for &ldquo;waterway to the moon.&rdquo; It reflects the journey every
          woman takes in her own time, in her own way - ever flowing, ever rising. The kind
          of strength that moves like water: gentle, but capable of shaping everything it
          touches.
        </p>
        <p>
          Each piece in our collection is timeless and thoughtfully crafted with a touch of
          feminism and minimalism. We specialise in moissanite and pearls with the intention
          of <em>accessible luxury</em>.
        </p>
        <p>
          Whether you are building your dreams, riding the waves or finding peace in
          stillness — we see you. You are not either/or. You are both. soft yet unbreakable.
        </p>
        <p className="font-serif text-base text-charcoal/80 italic">
          Welcome to Miozuki.
        </p>
      </div>

      <div className="mt-10 pt-10 border-t border-charcoal/8 flex gap-6">
        <Link
          href="/pages/our-founder"
          className="text-xs tracking-widest uppercase text-burgundy hover:text-burgundy/70 transition-colors underline underline-offset-4"
        >
          Meet Our Founder
        </Link>
        <Link
          href="/collections/moissanite-nz"
          className="text-xs tracking-widest uppercase text-charcoal/65 hover:text-charcoal transition-colors"
        >
          Shop the Collection
        </Link>
      </div>
    </main>
  );
}
