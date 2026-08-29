'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const MESSAGES = [
  'Complimentary NZ shipping over $300',
  'NZ-owned & operated · Ships from Auckland',
  'AU shipping available',
  '6-month warranty on all pieces',
  'Unsure of your ring size? Start with our ring sizer',
];

const SEPARATOR = <span className="mx-6 opacity-20">◇</span>;
const SALE_END_DATE = { year: 2026, month: 9, day: 2 };
const DAY_MS = 24 * 60 * 60 * 1000;

function getNzDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === 'year')?.value),
    month: Number(parts.find((part) => part.type === 'month')?.value),
    day: Number(parts.find((part) => part.type === 'day')?.value),
  };
}

function toUtcDayNumber({ year, month, day }: { year: number; month: number; day: number }) {
  return Date.UTC(year, month - 1, day) / DAY_MS;
}

function getSaleMessage(date = new Date()) {
  const daysLeft = toUtcDayNumber(SALE_END_DATE) - toUtcDayNumber(getNzDateParts(date));

  if (daysLeft < 0) {
    return 'EARRING SALE HAS ENDED';
  }

  if (daysLeft === 0) {
    return 'EARRING SALE ENDS TODAY';
  }

  return `EARRING SALE ENDING IN ${daysLeft} ${daysLeft === 1 ? 'DAY' : 'DAYS'}`;
}

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
  const [saleMessage, setSaleMessage] = useState(() => getSaleMessage());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSaleMessage(getSaleMessage());
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="border-b border-charcoal/12">
      <div className="bg-cream text-charcoal text-[12px] tracking-[0.04em] py-2.5 overflow-hidden">
        <div className="announcement-marquee-track">
          <MessageList />
          <MessageList />
        </div>
      </div>
      <div className="border-y border-gold/45 bg-charcoal px-4 py-3 text-center font-sans text-cream">
        <Link href="/collections/moissanite-earrings" className="inline-block underline-offset-4 hover:underline">
          <span className="block text-[14px] font-medium uppercase leading-none tracking-[0.12em] sm:text-[15px]">
            {saleMessage}
          </span>
          <span className="mt-1 block text-[10px] font-light leading-snug tracking-[0.03em] normal-case text-cream/80 sm:text-[11px]">
            (discount codes cannot be applied to sale items)
          </span>
        </Link>
      </div>
    </div>
  );
}
