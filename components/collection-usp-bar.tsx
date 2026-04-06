const USPS = [
  {
    label: 'NZ Fine Jewellery Brand',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect x="5" y="10" width="30" height="25" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M5 17h30" stroke="currentColor" strokeWidth="2" />
        <path d="M13 6v8M27 6v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 24h6M22 24h6M12 29h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Accessible Luxury',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path
          d="M20 33s-13-8.5-13-17a7 7 0 0 1 13-3.6A7 7 0 0 1 33 16c0 8.5-13 17-13 17z"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Complimentary Ring Engraving',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect x="7" y="13" width="26" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M7 20h26" stroke="currentColor" strokeWidth="2" />
        <path d="M14 6h12l3 7H11l3-7z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
        <path d="M16 25h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Afterpay Available',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path
          d="M30 8H10a3 3 0 0 0-3 3v18a3 3 0 0 0 3 3h20a3 3 0 0 0 3-3V11a3 3 0 0 0-3-3z"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="28" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M10 20h12M10 25h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function CollectionUspBar() {
  return (
    <div className="bg-burgundy text-cream">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {USPS.map(({ label, icon }) => (
            <div key={label} className="flex flex-col items-center gap-4 text-center">
              <div className="opacity-80">{icon}</div>
              <p className="text-sm tracking-wide leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
