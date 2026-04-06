import Link from 'next/link';

export default function AnnouncementBar() {
  return (
    <div className="bg-charcoal text-cream text-center text-xs tracking-wide py-2.5 px-4">
      NZ Flat Shipping $8{' '}
      <span className="opacity-30 mx-1.5">|</span>
      <span className="font-medium">Unsure of your ring size?</span>{' '}
      <Link
        href="/products/order-your-ring-sizer-credited-toward-your-custom-bespoke-ring"
        className="underline underline-offset-2 hover:opacity-80 transition-opacity"
      >
        Start with our $1 ring sizer
      </Link>
    </div>
  );
}
