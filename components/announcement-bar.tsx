const MESSAGES = [
  'Free NZ shipping on orders over $150',
  'NZ-owned & operated · Ships from Auckland',
  '30-day returns',
  'Lifetime warranty on all pieces',
  'Unsure of your ring size? Start with our $1 ring sizer',
];

const SEPARATOR = <span className="mx-6 opacity-20">◇</span>;

function MessageList() {
  return (
    <span className="flex items-center whitespace-nowrap" aria-hidden>
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
    <div
      className="bg-charcoal text-cream text-[11px] tracking-[0.12em] py-2.5 overflow-hidden"
      aria-label="Site announcements"
    >
      <div className="flex" style={{ animation: 'marquee 38s linear infinite' }}>
        <MessageList />
        <MessageList />
      </div>
    </div>
  );
}
