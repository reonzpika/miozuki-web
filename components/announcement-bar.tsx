import Link from 'next/link';

const MESSAGES = [
  'Complimentary NZ shipping over $300',
  'NZ-owned & operated · Ships from Auckland',
  'AU shipping available',
  '6-month warranty on all pieces',
  'Unsure of your ring size? Start with our ring sizer',
];

const SEPARATOR = <span className="mx-6 opacity-20">◇</span>;

function MessageList() {
  return (
    <span className="flex shrink-0 items-center whitespace-nowrap" aria-hidden>
      {MESSAGES.map((msg, i) => (
        <span key={i} className="flex items-center">
          {msg}
          {SEPARATOR}
        </span>
      ))}
    </span>
  );
}

export default function AnnouncementBar() {
  return (
    <div className="border-b border-charcoal/12">
      <div className="bg-cream text-charcoal text-[12px] tracking-[0.04em] py-2.5 overflow-hidden">
        <div className="announcement-marquee-track">
          <MessageList />
          <MessageList />
        </div>
      </div>
      <div className="border-y border-gold/45 bg-charcoal px-4 py-3 text-center font-sans text-[14px] font-medium uppercase leading-none tracking-[0.12em] text-cream sm:text-[15px]">
        <Link href="/collections/moissanite-earrings" className="inline-block underline-offset-4 hover:underline">
          EARRINGS SALE IS LIVE
        </Link>
      </div>
    </div>
  );
}
