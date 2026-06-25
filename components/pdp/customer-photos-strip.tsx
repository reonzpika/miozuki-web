import Image from 'next/image';
import Link from 'next/link';
import type { ShopifyImage } from '@/lib/shopify';
import { ChevronRightIcon } from '@/components/pdp/chevron-right';

/** Extra product angles as a visual strip (layout analogue to UGC in the mockup). */
export function PdpCustomerPhotosStrip({
  images,
  title,
}: {
  images: ShopifyImage[];
  title: string;
}) {
  const strip = images.slice(1, 5);
  if (strip.length === 0) return null;

  return (
    <section aria-labelledby="pdp-photos-heading" className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-charcoal/40">
          On the product
        </p>
        <h2
          id="pdp-photos-heading"
          className="mt-2 font-serif text-2xl leading-tight text-charcoal"
        >
          More angles
        </h2>
        <p className="mt-2 text-sm text-charcoal/65">
          Swipe the gallery above or compare these stills before you read
          reviews.
        </p>
      </div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {strip.map((img, i) => (
          <li
            key={img.url}
            className={`relative aspect-[3/4] overflow-hidden bg-cream/60${i >= 3 ? ' sm:hidden' : ''}`}
          >
            <Image
              src={img.url}
              alt={img.altText ?? `${title}, photo ${i + 2}`}
              fill
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 180px"
              className="object-cover"
            />
          </li>
        ))}
      </ul>
      <Link
        href="#reviews"
        className="inline-flex items-center gap-1 text-xs font-medium text-burgundy underline underline-offset-4 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        Jump to reviews
        <ChevronRightIcon className="text-burgundy" />
      </Link>
    </section>
  );
}
