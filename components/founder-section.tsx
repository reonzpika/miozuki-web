import Image from 'next/image';
import Link from 'next/link';
import ScrollReveal from '@/components/scroll-reveal';

export default function FounderSection() {
  return (
    <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto w-full">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <ScrollReveal>
          <p className="text-xs tracking-[0.3em] uppercase text-burgundy mb-3">Our founder</p>
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal leading-tight mb-6">
            Miozuki 澪月,<br />a waterway to the moon
          </h2>
          <p className="text-sm md:text-base text-charcoal/70 leading-relaxed mb-4">
            Kia Ora, I&apos;m Ting Eguchi, the founder of Miozuki. From my studio in Auckland,
            each piece is carefully prepared and wrapped — with the same intention that goes
            into choosing every piece. Thank you for finding your way here.
          </p>
          <p className="text-sm md:text-base text-charcoal/70 leading-relaxed mb-8">
            Miozuki was born during a trip to Japan, after I picked a fortune slip at a shrine.
            It is for the woman who glows like the moon, flows like water — graceful,
            yet unforgettable.
          </p>
          <Link
            href="/pages/our-founder"
            className="inline-block text-xs tracking-[0.2em] uppercase text-burgundy border border-burgundy/40 px-8 py-3 hover:bg-burgundy hover:text-cream transition-colors duration-300"
          >
            Meet the founder
          </Link>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="https://cdn.shopify.com/s/files/1/0797/0819/3023/files/PXL_20241230_060931026_3_480x480.jpg?v=1767920670"
              alt="Ting Eguchi, founder of Miozuki"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top"
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
