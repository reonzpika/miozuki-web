import Image from 'next/image';
import Link from 'next/link';
import ScrollReveal from '@/components/scroll-reveal';

export default function FounderSection() {
  return (
    <section className="w-full" aria-labelledby="founder-heading">
      <div className="grid md:grid-cols-2 md:items-stretch">
        <ScrollReveal className="order-2 md:order-1">
          <div className="flex h-full min-h-[20rem] flex-col justify-center bg-cream px-6 py-16 text-charcoal md:px-10 md:py-24 lg:pl-[max(1.5rem,calc((100vw-80rem)/2+2.5rem))]">
            <div className="mb-5 h-px w-10 bg-gold" aria-hidden />
            <p className="text-xs tracking-[0.3em] uppercase text-charcoal/65 mb-3">Our founder</p>
            <h2
              id="founder-heading"
              className="font-serif text-3xl md:text-4xl text-charcoal leading-tight mb-6"
            >
              Miozuki 澪月,<br />a waterway to the moon
            </h2>
            <p className="text-sm md:text-base text-charcoal/85 leading-relaxed mb-4">
              Kia Ora, I&apos;m Ting Eguchi, the founder of Miozuki. From my studio in Auckland,
              each piece is carefully prepared and wrapped, with the same intention that goes
              into choosing every piece. Thank you for finding your way here.
            </p>
            <p className="text-sm md:text-base text-charcoal/85 leading-relaxed mb-8">
              Miozuki was born during a trip to Japan, after I picked a fortune slip at a shrine.
              It is for the woman who glows like the moon, flows like water; graceful,
              yet unforgettable.
            </p>
            <Link
              href="/pages/our-founder"
              className="inline-block w-fit rounded-full border border-burgundy bg-burgundy px-8 py-3 text-xs tracking-[0.04em] uppercase text-cream transition-colors duration-300 hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/45 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Meet the founder
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="order-1 flex min-h-[18rem] flex-col md:order-2 md:h-full md:min-h-0">
          <div className="relative h-full min-h-[18rem] w-full flex-1 overflow-hidden border-y-0 border-l-0 border-r border-cream bg-burgundy md:min-h-0">
            <Image
              src="https://cdn.shopify.com/s/files/1/0797/0819/3023/files/PXL_20241230_060931026_3_480x480.jpg?v=1767920670&width=2400"
              alt="Ting Eguchi, founder of Miozuki"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 960px"
              className="border-0 object-cover object-[50%_25%] outline-none ring-0"
              quality={95}
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
