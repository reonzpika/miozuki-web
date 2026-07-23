const ITEMS = [
  {
    label: 'Free shipping $300+',
    sub: 'NZ tracked + signed',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7h11v10H3z" />
        <path d="M14 10h4l3 3v4h-7" />
        <circle cx="7" cy="18" r="1.6" />
        <circle cx="17" cy="18" r="1.6" />
      </svg>
    ),
  },
  {
    label: 'NZ-owned',
    sub: 'Ships to NZ & Australia',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s-7-4.35-7-11a7 7 0 1 1 14 0c0 6.65-7 11-7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    label: '6-months warranty',
    sub: 'On every piece',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Secure checkout',
    sub: 'Shopify Payments',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="10" width="16" height="11" rx="1.5" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    ),
  },
];

export default function PdpTrustStrip() {
  return (
    <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 border border-charcoal/8 rounded-sm p-4">
      {ITEMS.map((item) => (
        <li
          key={item.label}
          className="flex items-center gap-3 text-charcoal/75"
        >
          <span className="text-burgundy shrink-0">{item.svg}</span>
          <span className="flex flex-col leading-tight">
            <span className="text-[11px] tracking-wide font-medium text-charcoal">
              {item.label}
            </span>
            <span className="text-[10px] tracking-wide text-charcoal/65">
              {item.sub}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
